import { Mistral } from '@mistralai/mistralai';

/**
 * Structured error for LLM operations
 */
class LLMError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'LLMError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

/**
 * Mistral AI client configuration
 * Note: stream is set to false - no SSE streaming
 * 
 * Requirements:
 * - 11.1: Connect to Mistral AI using configured API credentials
 * - 11.2: Include composed system and user prompts
 * - 11.3: Return structured error with retry information on failure
 * - 11.4: Extract and return JSON content from response
 * - 11.5: Handle rate limiting with appropriate backoff strategies
 */
class MistralClient {
  /**
   * Create a new Mistral client
   * @param {string} apiKey - Mistral API key (defaults to MISTRAL_API_KEY env var)
   * @param {Object} options - Configuration options
   * @param {string} options.model - Model to use (default: mistral-large-latest)
   * @param {number} options.maxRetries - Maximum retry attempts for rate limiting (default: 3)
   * @param {number} options.baseDelay - Base delay in ms for exponential backoff (default: 1000)
   */
  constructor(apiKey = process.env.MISTRAL_API_KEY, options = {}) {
    if (!apiKey) {
      throw new LLMError(
        'MISSING_API_KEY',
        'Mistral API key is required. Set MISTRAL_API_KEY environment variable or pass it to the constructor.',
        {}
      );
    }

    this.client = new Mistral({ apiKey });
    this.model = options.model || 'mistral-large-latest';
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
  }

  /**
   * Sleep for a specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate backoff delay with exponential increase
   * @param {number} attempt - Current attempt number (0-indexed)
   * @param {number} retryAfter - Optional retry-after header value in seconds
   * @returns {number} - Delay in milliseconds
   */
  calculateBackoff(attempt, retryAfter = null) {
    if (retryAfter) {
      return retryAfter * 1000;
    }
    // Exponential backoff: baseDelay * 2^attempt with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return exponentialDelay + jitter;
  }

  /**
   * Send chat request to Mistral AI
   * @param {Object} options - Chat options
   * @param {string} options.systemPrompt - System prompt
   * @param {string} options.userPrompt - User prompt
   * @param {string} options.responseFormat - Expected response format ('json' or 'text')
   * @returns {Promise<Object>} - Parsed response or content object
   * @throws {LLMError} - Structured error on failure
   */
  async chat({ systemPrompt, userPrompt, responseFormat = 'json' }) {
    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.complete({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          responseFormat: responseFormat === 'json' 
            ? { type: 'json_object' } 
            : undefined,
          stream: false  // No SSE streaming - wait for complete response
        });

        const content = response.choices?.[0]?.message?.content;

        if (!content) {
          throw new LLMError(
            'EMPTY_RESPONSE',
            'LLM returned an empty response',
            { response }
          );
        }

        // Extract and return JSON content (Requirement 11.4)
        if (responseFormat === 'json') {
          try {
            return JSON.parse(content);
          } catch (parseError) {
            throw new LLMError(
              'JSON_PARSE_ERROR',
              'Failed to parse LLM response as JSON',
              { 
                content,
                parseError: parseError.message 
              }
            );
          }
        }

        return { content };

      } catch (error) {
        // If it's already an LLMError, rethrow it (unless it's retryable)
        if (error instanceof LLMError && error.code !== 'RATE_LIMITED') {
          throw error;
        }

        // Handle rate limiting (Requirement 11.5)
        const isRateLimited = error.status === 429 || error.code === 'RATE_LIMITED';
        
        if (isRateLimited && attempt < this.maxRetries) {
          const retryAfter = error.headers?.['retry-after'] 
            ? parseInt(error.headers['retry-after'], 10) 
            : null;
          const delay = this.calculateBackoff(attempt, retryAfter);
          
          lastError = new LLMError(
            'RATE_LIMITED',
            'Rate limit exceeded, retrying...',
            { 
              retryAfter,
              attempt: attempt + 1,
              maxRetries: this.maxRetries,
              nextRetryIn: delay
            }
          );
          
          await this.sleep(delay);
          continue;
        }

        // Return structured error with retry information (Requirement 11.3)
        if (isRateLimited) {
          throw new LLMError(
            'RATE_LIMITED',
            'Rate limit exceeded after maximum retries',
            { 
              retryAfter: error.headers?.['retry-after'],
              attempts: attempt + 1,
              maxRetries: this.maxRetries
            }
          );
        }

        // Handle connection and other errors
        throw new LLMError(
          'LLM_CONNECTION',
          error.message || 'Failed to connect to LLM',
          { 
            originalError: error.toString(),
            status: error.status
          }
        );
      }
    }

    // Should not reach here, but just in case
    throw lastError || new LLMError(
      'UNKNOWN_ERROR',
      'An unknown error occurred',
      {}
    );
  }
}

export { MistralClient, LLMError };
export default MistralClient;
