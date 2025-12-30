/**
 * Tool Registry - Centralized registry for tool definitions
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

/**
 * Centralized tool registry for managing tool definitions
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a tool with validation
   * @param {Object} tool - Tool definition
   * @param {string} tool.name - Tool name
   * @param {string} tool.description - Tool description
   * @param {string} tool.action_id - Unique action identifier
   * @param {Array} tool.parameters - Parameter definitions
   * @param {Function} tool.handler - Tool handler function
   * @throws {Error} If tool definition is invalid or action_id already exists
   */
  register(tool) {
    // Validate required fields
    const requiredFields = ['name', 'action_id', 'parameters', 'handler'];
    for (const field of requiredFields) {
      if (tool[field] === undefined || tool[field] === null) {
        throw new Error(`Tool registration failed: missing required field '${field}'`);
      }
    }

    // Validate handler is a function
    if (typeof tool.handler !== 'function') {
      throw new Error(`Tool registration failed: handler must be a function`);
    }

    // Validate parameters is an array
    if (!Array.isArray(tool.parameters)) {
      throw new Error(`Tool registration failed: parameters must be an array`);
    }

    // Validate each parameter has required fields
    for (const param of tool.parameters) {
      if (!param.name || !param.type) {
        throw new Error(`Tool registration failed: each parameter must have 'name' and 'type'`);
      }
    }

    // Check for duplicate action_id
    if (this.tools.has(tool.action_id)) {
      throw new Error(`Tool registration failed: action_id '${tool.action_id}' already registered`);
    }

    // Store the tool
    this.tools.set(tool.action_id, {
      name: tool.name,
      description: tool.description || '',
      action_id: tool.action_id,
      endpoint: tool.endpoint || null,
      parameters: tool.parameters,
      returns: tool.returns || 'object',
      handler: tool.handler
    });
  }

  /**
   * Get tool by action_id
   * @param {string} actionId - The action identifier
   * @returns {Object|null} Tool definition or null if not found
   */
  get(actionId) {
    return this.tools.get(actionId) || null;
  }

  /**
   * Execute tool with parameters
   * @param {string} actionId - The action identifier
   * @param {Object} params - Parameters to pass to the tool
   * @returns {Promise<Object>} Execution result
   */
  async execute(actionId, params = {}) {
    const startTime = Date.now();
    const tool = this.get(actionId);

    if (!tool) {
      return {
        success: false,
        data: null,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `No tool registered for action: ${actionId}`,
          details: { actionId }
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: null
        }
      };
    }

    // Validate required parameters
    const missingParams = [];
    for (const param of tool.parameters) {
      if (param.required && (params[param.name] === undefined || params[param.name] === null)) {
        missingParams.push(param.name);
      }
    }

    if (missingParams.length > 0) {
      return {
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Missing required parameter: ${missingParams[0]}`,
          details: { 
            parameter: missingParams[0], 
            required: missingParams,
            provided: Object.keys(params)
          }
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: tool.name
        }
      };
    }

    // Execute the handler
    try {
      const result = await tool.handler(params);
      return {
        success: true,
        data: result,
        error: null,
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: tool.name
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: 'EXECUTION_ERROR',
          message: 'Tool execution failed',
          details: { 
            toolName: tool.name, 
            error: error.message 
          }
        },
        metadata: {
          executionTime: Date.now() - startTime,
          toolName: tool.name
        }
      };
    }
  }

  /**
   * Export definitions for prompt generation (without handlers)
   * @returns {Array<Object>} Tool definitions for LLM consumption
   */
  getPromptDefinitions() {
    const definitions = [];
    for (const tool of this.tools.values()) {
      definitions.push({
        name: tool.name,
        description: tool.description,
        action_id: tool.action_id,
        parameters: tool.parameters.map(p => ({
          name: p.name,
          type: p.type,
          description: p.description || '',
          required: p.required || false
        })),
        returns: tool.returns
      });
    }
    return definitions;
  }

  /**
   * Check if a tool is registered
   * @param {string} actionId - The action identifier
   * @returns {boolean}
   */
  has(actionId) {
    return this.tools.has(actionId);
  }

  /**
   * Get all registered action IDs
   * @returns {Array<string>}
   */
  getActionIds() {
    return Array.from(this.tools.keys());
  }

  /**
   * Clear all registered tools
   */
  clear() {
    this.tools.clear();
  }
}

// Export singleton instance and class
const toolRegistry = new ToolRegistry();

export { ToolRegistry };
export default toolRegistry;
