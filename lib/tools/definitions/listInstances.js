/**
 * Example Tool Definition - List Instances
 * Requirements: 5.1
 * 
 * This is an example tool that demonstrates listing cloud instances.
 * It simulates retrieving a list of cloud instances.
 */

import toolRegistry from '../registry.js';

/**
 * List Instances Tool Definition
 */
const listInstancesTool = {
  name: 'List Instances',
  description: 'Lists all cloud instances with optional filtering',
  action_id: 'list_instances',
  endpoint: '/api/tools/list-instances',
  parameters: [
    {
      name: 'region',
      type: 'string',
      description: 'Filter by AWS region (optional)',
      required: false
    },
    {
      name: 'state',
      type: 'string',
      description: 'Filter by instance state (running, stopped, pending)',
      required: false
    }
  ],
  returns: 'array',
  
  /**
   * Handler function for listing instances
   * @param {Object} params - Tool parameters
   * @returns {Promise<Array>} List of instances
   */
  handler: async (params) => {
    const { region, state } = params;
    
    // Simulate instance data (in real implementation, this would call AWS SDK)
    const mockInstances = [
      {
        instanceId: 'i-abc123def456',
        instanceName: 'web-server-1',
        instanceType: 't2.micro',
        region: 'us-east-1',
        state: 'running',
        publicIp: '54.123.45.67',
        privateIp: '10.0.1.100',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        instanceId: 'i-def456ghi789',
        instanceName: 'api-server-1',
        instanceType: 't2.small',
        region: 'us-west-2',
        state: 'running',
        publicIp: '52.234.56.78',
        privateIp: '10.0.2.50',
        createdAt: '2024-02-20T14:45:00Z'
      },
      {
        instanceId: 'i-ghi789jkl012',
        instanceName: 'db-server-1',
        instanceType: 't2.medium',
        region: 'us-east-1',
        state: 'stopped',
        publicIp: null,
        privateIp: '10.0.1.200',
        createdAt: '2024-03-10T08:15:00Z'
      }
    ];
    
    // Apply filters
    let filteredInstances = mockInstances;
    
    if (region) {
      filteredInstances = filteredInstances.filter(i => i.region === region);
    }
    
    if (state) {
      filteredInstances = filteredInstances.filter(i => i.state === state);
    }
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      instances: filteredInstances,
      count: filteredInstances.length,
      filters: { region, state }
    };
  }
};

/**
 * Register the tool with the registry
 */
function registerListInstancesTool() {
  toolRegistry.register(listInstancesTool);
}

export { listInstancesTool, registerListInstancesTool };
export default listInstancesTool;
