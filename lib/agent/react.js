/**
 * ReAct Agent - Implements Reasoning → Action → Observation loop
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { parse } from '../vm2/parser.js';

/**
 * Agent states for the ReAct loop
 */
export const AgentState = {
  IDLE: 'idle',
  REASONING: 'reasoning',
  ACTING: 'acting',
  OBSERVING: 'observing',
  DECIDING: 'deciding'
};

/**
 * Decision types after observation
 */
export const DecisionType = {
  COMPLETE: 'complete',      // Task finished successfully
  CONTINUE: 'continue',      // Proceed to next step
  RETRY: 'retry',            // Retry with adjusted approach
  ERROR: 'error'             // Unrecoverable error
};

/**
 * Non-retryable error codes
 */
const NON_RETRYABLE_CODES = ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND'];

/**
 * ReAct agent implementing Reasoning → Action → Observation loop
 */
class ReActAgent {
  /**
   * Create a new ReAct agent
   * @param {Object} llmClient - LLM client instance (MistralClient)
   * @param {Object} promptComposer - Prompt composer instance
   * @param {Object} router - Action router instance
   * @param {Object} config - Configuration options
   * @param {number} config.maxRetries - Maximum retry attempts (default: 3)
   */
  constructor(llmClient, promptComposer, router, config = {}) {
    if (!llmClient) {
      throw new Error('ReActAgent requires an LLM client');
    }
    if (!promptComposer) {
      throw new Error('ReActAgent requires a prompt composer');
    }
    if (!router) {
      throw new Error('ReActAgent requires an action router');
    }

    this.llm = llmClient;
    this.composer = promptComposer;
    this.router = router;
    this.maxRetries = config.maxRetries || 3;
    this.state = AgentState.IDLE;
  }


  /**
   * Process user query - entry point for new interactions
   * Requirements: 1.1
   * @param {string} query - User's natural language query
   * @param {Object} context - Current session context
   * @returns {Promise<AgentResponse>}
   */
  async process(query, context = {}) {
    this.state = AgentState.REASONING;
    
    // Step 1: REASON - Analyze query and determine intent
    const reasoning = await this.reason(query, context);
    
    // Step 2: ACT - Generate appropriate UI response
    this.state = AgentState.ACTING;
    const action = await this.act(reasoning, context);
    
    // Step 3: Return UI for user interaction
    this.state = AgentState.IDLE;
    return {
      type: 'ui',
      ui: action.ui,
      context: this.updateContext(context, { query, reasoning, action })
    };
  }

  /**
   * Process form submission - handles user form interactions
   * Requirements: 1.1, 1.4
   * @param {string} actionId - The action_id from the submitted form
   * @param {Object} formData - Form field values
   * @param {Object} context - Current session context
   * @returns {Promise<AgentResponse>}
   */
  async processAction(actionId, formData, context = {}) {
    let retryCount = 0;
    let currentContext = { ...context, formData };
    
    while (retryCount < this.maxRetries) {
      // Step 1: ACT - Execute the tool
      this.state = AgentState.ACTING;
      const toolResult = await this.executeTool(actionId, formData);
      
      // Step 2: OBSERVE - Evaluate the result
      this.state = AgentState.OBSERVING;
      const observation = this.observe(toolResult, currentContext);
      
      // Step 3: DECIDE - Determine next action
      this.state = AgentState.DECIDING;
      const decision = await this.decide(observation, currentContext);
      
      switch (decision.type) {
        case DecisionType.COMPLETE:
          // Generate success UI and return
          this.state = AgentState.IDLE;
          return await this.generateResultUI(toolResult, currentContext);
          
        case DecisionType.CONTINUE:
          // Generate next step UI
          this.state = AgentState.IDLE;
          return await this.generateNextStepUI(toolResult, currentContext);
          
        case DecisionType.RETRY:
          // Update context with failure info and retry
          retryCount++;
          currentContext = this.updateContextForRetry(
            currentContext, 
            observation, 
            decision.adjustments
          );
          // Loop continues with updated context
          break;
          
        case DecisionType.ERROR:
          // Generate error UI
          this.state = AgentState.IDLE;
          return await this.generateErrorUI(observation.error, currentContext);
      }
    }
    
    // Max retries exceeded
    this.state = AgentState.IDLE;
    return await this.generateErrorUI(
      { code: 'MAX_RETRIES', message: 'Maximum retry attempts exceeded' },
      currentContext
    );
  }

  /**
   * Execute tool via router
   * @param {string} actionId - Tool action ID
   * @param {Object} params - Tool parameters
   * @returns {Promise<ToolResult>}
   */
  async executeTool(actionId, params) {
    return await this.router.route(actionId, params);
  }


  /**
   * REASON phase - Analyze context and determine intent
   * Requirements: 1.1
   * @param {string} query - User query
   * @param {Object} context - Session context
   * @returns {Promise<ReasoningResult>}
   */
  async reason(query, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      query,
      phase: 'reasoning'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    return {
      intent: response.intent,
      requiredInfo: response.requiredInfo,
      confidence: response.confidence
    };
  }

  /**
   * ACT phase - Generate UI or prepare tool execution
   * Requirements: 1.1, 1.3
   * @param {ReasoningResult} reasoning - Result from reason phase
   * @param {Object} context - Session context
   * @returns {Promise<ActionResult>}
   */
  async act(reasoning, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      reasoning,
      phase: 'acting'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    // Parse and validate the VM2 component structure
    const jsonString = typeof response === 'string' 
      ? response 
      : JSON.stringify(response);
    
    const parseResult = parse(jsonString);
    if (!parseResult.success) {
      throw new Error(`Invalid UI structure: ${parseResult.error.message}`);
    }
    
    return {
      ui: parseResult.data
    };
  }

  /**
   * OBSERVE phase - Evaluate tool execution result
   * Requirements: 1.2
   * @param {ToolResult} result - Tool execution result
   * @param {Object} context - Session context
   * @returns {Observation}
   */
  observe(result, context) {
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      reason: result.success ? null : (result.error?.message || 'Tool execution failed')
    };
  }

  /**
   * DECIDE phase - Determine next action based on observation
   * Requirements: 1.2, 1.3
   * @param {Observation} observation - Result of observe phase
   * @param {Object} context - Session context
   * @returns {Promise<Decision>}
   */
  async decide(observation, context) {
    // If successful
    if (observation.success) {
      return {
        type: DecisionType.COMPLETE,
        adjustments: null
      };
    }
    
    // If failed but retryable
    if (this.isRetryable(observation)) {
      // Ask LLM for adjustments
      const adjustments = await this.inferAdjustments(observation, context);
      return {
        type: DecisionType.RETRY,
        adjustments
      };
    }
    
    // Unrecoverable error
    return {
      type: DecisionType.ERROR,
      error: observation.error || { code: 'UNKNOWN', message: observation.reason }
    };
  }

  /**
   * Check if error is retryable
   * @param {Observation} observation - Observation result
   * @returns {boolean}
   */
  isRetryable(observation) {
    if (observation.error && NON_RETRYABLE_CODES.includes(observation.error.code)) {
      return false;
    }
    return true;
  }


  /**
   * Ask LLM to infer adjustments for retry
   * Requirements: 1.3, 1.4
   * @param {Observation} observation - Failed observation
   * @param {Object} context - Session context
   * @returns {Promise<Object>}
   */
  async inferAdjustments(observation, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      observation,
      phase: 'inferring_adjustments',
      instruction: 'Analyze the failure and suggest parameter adjustments for retry'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    return response.adjustments || {};
  }

  /**
   * Generate result UI for completed action
   * Requirements: 1.3
   * @param {Object} result - Tool execution result
   * @param {Object} context - Session context
   * @returns {Promise<AgentResponse>}
   */
  async generateResultUI(result, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      result,
      phase: 'generating_result_ui'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    const jsonString = typeof response === 'string' 
      ? response 
      : JSON.stringify(response);
    
    const parseResult = parse(jsonString);
    if (!parseResult.success) {
      throw new Error(`Invalid result UI structure: ${parseResult.error.message}`);
    }
    
    return {
      type: 'result',
      ui: parseResult.data,
      context: this.updateContext(context, { completed: true, result })
    };
  }

  /**
   * Generate UI for next workflow step
   * Requirements: 1.3
   * @param {Object} result - Previous step result
   * @param {Object} context - Session context
   * @returns {Promise<AgentResponse>}
   */
  async generateNextStepUI(result, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      previousResult: result,
      phase: 'generating_next_step_ui'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    const jsonString = typeof response === 'string' 
      ? response 
      : JSON.stringify(response);
    
    const parseResult = parse(jsonString);
    if (!parseResult.success) {
      throw new Error(`Invalid next step UI structure: ${parseResult.error.message}`);
    }
    
    return {
      type: 'ui',
      ui: parseResult.data,
      context: this.updateContext(context, { previousResult: result })
    };
  }

  /**
   * Generate error UI
   * Requirements: 1.3, 1.4
   * @param {Object} error - Error information
   * @param {Object} context - Session context
   * @returns {Promise<AgentResponse>}
   */
  async generateErrorUI(error, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      error,
      phase: 'generating_error_ui'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    const jsonString = typeof response === 'string' 
      ? response 
      : JSON.stringify(response);
    
    const parseResult = parse(jsonString);
    if (!parseResult.success) {
      throw new Error(`Invalid error UI structure: ${parseResult.error.message}`);
    }
    
    return {
      type: 'error',
      ui: parseResult.data,
      context: this.updateContext(context, { error })
    };
  }


  /**
   * Update context with new information
   * Requirements: 1.5
   * @param {Object} context - Current context
   * @param {Object} updates - New information to add
   * @returns {Object} Updated context
   */
  updateContext(context, updates) {
    return {
      ...context,
      conversationHistory: [
        ...(context.conversationHistory || []),
        { timestamp: Date.now(), ...updates }
      ]
    };
  }

  /**
   * Update context for retry attempt
   * Requirements: 1.5
   * @param {Object} context - Current context
   * @param {Observation} observation - Failed observation
   * @param {Object} adjustments - Suggested adjustments
   * @returns {Object} Updated context with retry info
   */
  updateContextForRetry(context, observation, adjustments) {
    return {
      ...context,
      retryInfo: {
        previousObservation: observation,
        adjustments,
        attemptNumber: (context.retryInfo?.attemptNumber || 0) + 1
      }
    };
  }

  /**
   * Get current agent state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Reset agent to idle state
   */
  reset() {
    this.state = AgentState.IDLE;
  }
}

export { ReActAgent };
export default ReActAgent;
