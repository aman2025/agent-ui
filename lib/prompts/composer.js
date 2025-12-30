/**
 * Prompt Composer - Assembles prompts from modular layers
 * Requirements: 7.1, 7.2
 */

import basePrompt from './base.js';
import uiSchemaPrompt from './ui-schema.js';
import { generateToolsPrompt } from './tools.js';
import workflowsPrompt from './workflows.js';
import examplesPrompt from './examples.js';

/**
 * Assembles prompts from modular layers for LLM interactions
 */
class PromptComposer {
  /**
   * Create a new PromptComposer
   * @param {Object} options - Configuration options
   * @param {Object} options.toolRegistry - Tool registry instance
   * @param {Object} options.customBase - Custom base prompt module (optional)
   * @param {Object} options.customWorkflows - Custom workflows module (optional)
   */
  constructor(options = {}) {
    this.toolRegistry = options.toolRegistry || null;
    this.customBase = options.customBase || null;
    this.customWorkflows = options.customWorkflows || null;
  }

  /**
   * Compose full system prompt from all layers
   * Layers: Base → UI Schema → Tools → Workflows → Examples
   * @returns {string}
   */
  composeSystemPrompt() {
    const layers = [
      // Layer 1: Base - Agent identity and behavioral rules
      this.customBase ? this.customBase.getPrompt() : basePrompt.getPrompt(),
      
      // Layer 2: UI Schema - Component whitelist and type definitions
      uiSchemaPrompt.getPrompt(),
      
      // Layer 3: Tools - Dynamic tool definitions from registry
      this.getToolsPrompt(),
      
      // Layer 4: Workflows - Business workflow templates
      this.customWorkflows ? this.customWorkflows.getPrompt() : workflowsPrompt.getPrompt(),
      
      // Layer 5: Examples - Few-shot examples for guidance
      examplesPrompt.getPrompt()
    ];

    return layers.join('\n\n---\n\n');
  }

  /**
   * Get tools prompt from registry
   * @returns {string}
   */
  getToolsPrompt() {
    if (!this.toolRegistry) {
      return generateToolsPrompt([]);
    }
    const definitions = this.toolRegistry.getPromptDefinitions();
    return generateToolsPrompt(definitions);
  }

  /**
   * Compose user prompt with context
   * @param {Object} context - Context object
   * @param {string} context.query - User's query
   * @param {string} context.phase - Current agent phase
   * @param {Object} context.previousUI - Previous UI structure (optional)
   * @param {Object} context.formData - Form data from submission (optional)
   * @param {Object} context.result - API/tool result (optional)
   * @param {Object} context.error - Error information (optional)
   * @param {Array} context.conversationHistory - Previous interactions (optional)
   * @param {Object} context.reasoning - Reasoning result (optional)
   * @param {Object} context.observation - Observation result (optional)
   * @returns {string}
   */
  composeUserPrompt(context = {}) {
    const sections = [];

    // Add phase-specific instruction
    if (context.phase) {
      sections.push(this.getPhaseInstruction(context.phase));
    }

    // Add user query
    if (context.query) {
      sections.push(`## User Request\n${context.query}`);
    }

    // Add custom instruction if provided
    if (context.instruction) {
      sections.push(`## Instruction\n${context.instruction}`);
    }

    // Add previous UI context
    if (context.previousUI) {
      sections.push(`## Previous UI State\n\`\`\`json\n${JSON.stringify(context.previousUI, null, 2)}\n\`\`\``);
    }

    // Add form data from submission
    if (context.formData && Object.keys(context.formData).length > 0) {
      sections.push(`## Submitted Form Data\n\`\`\`json\n${JSON.stringify(context.formData, null, 2)}\n\`\`\``);
    }

    // Add API/tool result
    if (context.result) {
      sections.push(`## Tool Execution Result\n\`\`\`json\n${JSON.stringify(context.result, null, 2)}\n\`\`\``);
    }

    // Add previous result for next step generation
    if (context.previousResult) {
      sections.push(`## Previous Step Result\n\`\`\`json\n${JSON.stringify(context.previousResult, null, 2)}\n\`\`\``);
    }

    // Add error information
    if (context.error) {
      sections.push(`## Error Information\n\`\`\`json\n${JSON.stringify(context.error, null, 2)}\n\`\`\``);
    }

    // Add observation for retry scenarios
    if (context.observation) {
      sections.push(`## Observation\n\`\`\`json\n${JSON.stringify(context.observation, null, 2)}\n\`\`\``);
    }

    // Add reasoning context
    if (context.reasoning) {
      sections.push(`## Reasoning\n\`\`\`json\n${JSON.stringify(context.reasoning, null, 2)}\n\`\`\``);
    }

    // Add retry information
    if (context.retryInfo) {
      sections.push(`## Retry Information\nAttempt: ${context.retryInfo.attemptNumber}\nAdjustments: ${JSON.stringify(context.retryInfo.adjustments, null, 2)}`);
    }

    // Add conversation history (limited to recent entries)
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      const recentHistory = context.conversationHistory.slice(-5);
      const historyText = recentHistory.map((entry, i) => {
        return `Entry ${i + 1}: ${JSON.stringify(entry, null, 2)}`;
      }).join('\n\n');
      sections.push(`## Recent Conversation History\n${historyText}`);
    }

    // Add response instruction
    sections.push(this.getResponseInstruction(context.phase));

    return sections.join('\n\n');
  }

  /**
   * Get phase-specific instruction
   * @param {string} phase - Agent phase
   * @returns {string}
   */
  getPhaseInstruction(phase) {
    const instructions = {
      reasoning: `## Phase: Reasoning
Analyze the user's request and determine:
1. What is the user's intent?
2. What information is needed to fulfill the request?
3. What tool or workflow should be used?

Respond with a JSON object containing: intent, requiredInfo, confidence`,

      acting: `## Phase: Acting
Based on the reasoning, generate an appropriate UI response.
Create a form to collect required information or display results.`,

      generating_result_ui: `## Phase: Generating Result UI
The tool execution was successful. Generate a UI to display the results.
Include a success alert and any relevant data display.`,

      generating_next_step_ui: `## Phase: Generating Next Step UI
Generate the UI for the next step in the workflow.
Consider the previous result when creating the next form.`,

      generating_error_ui: `## Phase: Generating Error UI
An error occurred. Generate a UI to display the error and offer recovery options.
Include an error alert and retry/cancel buttons.`,

      inferring_adjustments: `## Phase: Inferring Adjustments
The previous action failed. Analyze the error and suggest adjustments.
Respond with a JSON object containing: adjustments (parameter modifications to try)`
    };

    return instructions[phase] || `## Phase: ${phase}`;
  }

  /**
   * Get response instruction based on phase
   * @param {string} phase - Agent phase
   * @returns {string}
   */
  getResponseInstruction(phase) {
    if (phase === 'reasoning' || phase === 'inferring_adjustments') {
      return `## Response Required
Respond with a valid JSON object as specified above. Do not include any text outside the JSON.`;
    }

    return `## Response Required
Generate a valid VM2 component structure as your response.
Your response must be a valid JSON object with a surfaceUpdate containing components.
Do not include any text outside the JSON structure.`;
  }

  /**
   * Set the tool registry
   * @param {Object} registry - Tool registry instance
   */
  setToolRegistry(registry) {
    this.toolRegistry = registry;
  }

  /**
   * Set custom base prompt
   * @param {Object} customBase - Custom base prompt module with getPrompt()
   */
  setCustomBase(customBase) {
    this.customBase = customBase;
  }

  /**
   * Set custom workflows
   * @param {Object} customWorkflows - Custom workflows module with getPrompt()
   */
  setCustomWorkflows(customWorkflows) {
    this.customWorkflows = customWorkflows;
  }
}

// Export class and factory function
export { PromptComposer };

/**
 * Create a new PromptComposer instance
 * @param {Object} options - Configuration options
 * @returns {PromptComposer}
 */
export function createPromptComposer(options = {}) {
  return new PromptComposer(options);
}

export default PromptComposer;
