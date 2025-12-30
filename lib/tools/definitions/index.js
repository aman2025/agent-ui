/**
 * Tool Definitions Index
 * Exports all tool definitions and provides a function to register all tools
 */

import { registerCreateInstanceTool } from './createInstance.js';

/**
 * Register all tool definitions with the registry
 */
function registerAllTools() {
  registerCreateInstanceTool();
}

export { registerAllTools };
export { createInstanceTool, registerCreateInstanceTool } from './createInstance.js';
