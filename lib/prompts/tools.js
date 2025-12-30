/**
 * Tools Prompt Generator - Generate tool definitions from registry
 * Requirements: 7.5
 */

/**
 * Format a single tool definition for LLM consumption
 * @param {Object} tool - Tool definition from registry
 * @returns {string}
 */
function formatToolDefinition(tool) {
  const params = tool.parameters.map(p => {
    const requiredMark = p.required ? ' (required)' : ' (optional)';
    return `    - ${p.name} (${p.type})${requiredMark}: ${p.description || 'No description'}`;
  }).join('\n');

  return `### ${tool.name}
- Action ID: \`${tool.action_id}\`
- Description: ${tool.description || 'No description provided'}
- Parameters:
${params || '    None'}
- Returns: ${tool.returns || 'object'}`;
}

/**
 * Generate tools prompt from registry definitions
 * @param {Array<Object>} toolDefinitions - Array of tool definitions from registry.getPromptDefinitions()
 * @returns {string}
 */
export function generateToolsPrompt(toolDefinitions) {
  if (!toolDefinitions || toolDefinitions.length === 0) {
    return `## Available Tools

No tools are currently registered. Generate UI for information gathering only.`;
  }

  const toolsSection = toolDefinitions.map(formatToolDefinition).join('\n\n');

  return `## Available Tools

The following tools are available for executing actions. When generating a form, use the tool's action_id in the Button component's action.name property.

${toolsSection}

## Tool Usage Guidelines
1. Match form fields to tool parameters
2. Use the exact action_id in Button components
3. Ensure all required parameters have corresponding form inputs
4. Validate user input before submission when possible
5. Display appropriate feedback after tool execution`;
}

/**
 * Get prompt for a specific tool
 * @param {Object} tool - Single tool definition
 * @returns {string}
 */
export function getToolPrompt(tool) {
  return formatToolDefinition(tool);
}

/**
 * Create a tools prompt generator bound to a registry
 * @param {Object} registry - Tool registry instance
 * @returns {Function} Function that returns the tools prompt
 */
export function createToolsPromptGenerator(registry) {
  return function getPrompt() {
    const definitions = registry.getPromptDefinitions();
    return generateToolsPrompt(definitions);
  };
}

export default {
  generateToolsPrompt,
  getToolPrompt,
  createToolsPromptGenerator
};
