/**
 * Action Router - Routes form actions to registered tools
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

/**
 * Routes form actions to tools and handles execution
 */
class ActionRouter {
  /**
   * Create an ActionRouter
   * @param {ToolRegistry} registry - The tool registry instance
   */
  constructor(registry) {
    if (!registry) {
      throw new Error('ActionRouter requires a ToolRegistry instance');
    }
    this.registry = registry;
  }

  /**
   * Route and execute an action
   * @param {string} actionId - The action_id from the submitted form
   * @param {Object} formData - Form field values
   * @returns {Promise<ActionResult>} Structured result object
   */
  async route(actionId, formData = {}) {
    // Validate actionId is provided
    if (!actionId || typeof actionId !== 'string') {
      return {
        success: false,
        data: null,
        error: {
          code: 'INVALID_ACTION_ID',
          message: 'Action ID must be a non-empty string',
          details: { actionId }
        }
      };
    }

    // Check if tool exists
    const tool = this.registry.get(actionId);
    if (!tool) {
      return {
        success: false,
        data: null,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `No tool registered for action: ${actionId}`,
          details: { actionId }
        }
      };
    }

    // Coerce form data to expected types before validation
    const coercedData = this.coerceParameters(tool, formData);

    // Validate required parameters before execution
    const validationResult = this.validateParameters(tool, coercedData);
    if (!validationResult.valid) {
      return {
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.message,
          details: validationResult.details
        }
      };
    }

    // Execute the tool through the registry
    const result = await this.registry.execute(actionId, coercedData);

    // Return structured result
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      metadata: result.metadata
    };
  }

  /**
   * Validate parameters against tool definition
   * @param {Object} tool - Tool definition
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParameters(tool, params) {
    const missingRequired = [];
    const typeErrors = [];

    for (const paramDef of tool.parameters) {
      const value = params[paramDef.name];

      // Check required parameters
      if (paramDef.required && (value === undefined || value === null || value === '')) {
        missingRequired.push(paramDef.name);
        continue;
      }

      // Skip type validation for optional undefined values
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (!this.validateType(value, paramDef.type)) {
        typeErrors.push({
          parameter: paramDef.name,
          expected: paramDef.type,
          received: typeof value
        });
      }
    }

    if (missingRequired.length > 0) {
      return {
        valid: false,
        message: `Missing required parameter: ${missingRequired[0]}`,
        details: {
          missingRequired,
          provided: Object.keys(params)
        }
      };
    }

    if (typeErrors.length > 0) {
      return {
        valid: false,
        message: `Invalid parameter type for: ${typeErrors[0].parameter}`,
        details: {
          typeErrors
        }
      };
    }

    return { valid: true };
  }

  /**
   * Validate value against expected type
   * @param {*} value - Value to validate
   * @param {string} expectedType - Expected type
   * @returns {boolean}
   */
  validateType(value, expectedType) {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'any':
        return true;
      default:
        // For unknown types, accept any value
        return true;
    }
  }

  /**
   * Coerce form values to expected types
   * Form inputs always return strings, so we need to convert them
   * @param {Object} tool - Tool definition
   * @param {Object} params - Raw parameters from form
   * @returns {Object} Coerced parameters
   */
  coerceParameters(tool, params) {
    const coerced = { ...params };

    for (const paramDef of tool.parameters) {
      const value = params[paramDef.name];

      // Skip undefined/null values
      if (value === undefined || value === null) {
        continue;
      }

      // Skip empty strings for optional params
      if (value === '' && !paramDef.required) {
        delete coerced[paramDef.name];
        continue;
      }

      const expectedType = paramDef.type.toLowerCase();

      // Only coerce if value is a string and expected type is different
      if (typeof value === 'string') {
        switch (expectedType) {
          case 'number':
            const num = Number(value);
            if (!isNaN(num)) {
              coerced[paramDef.name] = num;
            }
            break;

          case 'boolean':
            coerced[paramDef.name] = value === 'true' || value === '1';
            break;

          case 'object':
            // Try JSON parse first
            if (value.trim().startsWith('{')) {
              try {
                coerced[paramDef.name] = JSON.parse(value);
              } catch {
                // Try key=value,key=value format
                coerced[paramDef.name] = this.parseKeyValueString(value);
              }
            } else if (value.includes('=')) {
              // Parse key=value,key=value format (e.g., "Environment=Production,Team=DevOps")
              coerced[paramDef.name] = this.parseKeyValueString(value);
            } else if (value.trim() === '') {
              // Empty string becomes empty object for optional object params
              coerced[paramDef.name] = {};
            }
            break;

          case 'array':
            // Try JSON parse first
            if (value.trim().startsWith('[')) {
              try {
                coerced[paramDef.name] = JSON.parse(value);
              } catch {
                // Fall back to comma-separated
                coerced[paramDef.name] = value.split(',').map(s => s.trim()).filter(Boolean);
              }
            } else {
              // Comma-separated values
              coerced[paramDef.name] = value.split(',').map(s => s.trim()).filter(Boolean);
            }
            break;
        }
      }
    }

    return coerced;
  }

  /**
   * Parse key=value,key=value string into object
   * @param {string} str - String like "Environment=Production,Team=DevOps"
   * @returns {Object}
   */
  parseKeyValueString(str) {
    const result = {};
    if (!str || typeof str !== 'string') return result;

    const pairs = str.split(',');
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      if (key && valueParts.length > 0) {
        result[key.trim()] = valueParts.join('=').trim();
      }
    }
    return result;
  }

  /**
   * Check if an action is routable
   * @param {string} actionId - The action identifier
   * @returns {boolean}
   */
  canRoute(actionId) {
    return this.registry.has(actionId);
  }

  /**
   * Get available actions
   * @returns {Array<string>}
   */
  getAvailableActions() {
    return this.registry.getActionIds();
  }
}

export { ActionRouter };
export default ActionRouter;
