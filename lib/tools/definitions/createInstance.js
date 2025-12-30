/**
 * Example Tool Definition - Create Instance
 * Requirements: 5.1
 * 
 * This is an example tool that demonstrates the tool definition structure.
 * It simulates creating a cloud instance with specified parameters.
 */

import toolRegistry from '../registry.js';

/**
 * Create Instance Tool Definition
 */
const createInstanceTool = {
  name: 'Create Instance',
  description: 'Creates a new cloud instance with the specified configuration',
  action_id: 'create_instance',
  endpoint: '/api/tools/create-instance',
  parameters: [
    {
      name: 'instanceName',
      type: 'string',
      description: 'Name for the new instance',
      required: true
    },
    {
      name: 'instanceType',
      type: 'string',
      description: 'Instance type (e.g., t2.micro, t2.small, t2.medium)',
      required: true
    },
    {
      name: 'region',
      type: 'string',
      description: 'AWS region for the instance',
      required: true
    },
    {
      name: 'tags',
      type: 'object',
      description: 'Optional tags for the instance',
      required: false
    }
  ],
  returns: 'object',
  
  /**
   * Handler function for creating an instance
   * @param {Object} params - Tool parameters
   * @returns {Promise<Object>} Created instance details
   */
  handler: async (params) => {
    const { instanceName, instanceType, region, tags = {} } = params;
    
    // Simulate instance creation (in real implementation, this would call AWS SDK)
    const instanceId = `i-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      instanceId,
      instanceName,
      instanceType,
      region,
      state: 'pending',
      tags: {
        Name: instanceName,
        ...tags
      },
      createdAt: new Date().toISOString(),
      publicIp: null,
      privateIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };
  }
};

/**
 * Register the tool with the registry
 */
function registerCreateInstanceTool() {
  toolRegistry.register(createInstanceTool);
}

export { createInstanceTool, registerCreateInstanceTool };
export default createInstanceTool;
