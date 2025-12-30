/**
 * Tool Definitions Index
 * Exports all tool definitions and provides a function to register all tools
 */

import { registerCreateInstanceTool } from './createInstance.js';
import { registerListInstancesTool } from './listInstances.js';

/**
 * Register all tool definitions with the registry
 */
function registerAllTools() {
  registerCreateInstanceTool();
  registerListInstancesTool();
}

export { registerAllTools };
export { createInstanceTool, registerCreateInstanceTool } from './createInstance.js';
export { listInstancesTool, registerListInstancesTool } from './listInstances.js';
