/**
 * Workflow Templates - Define example workflow templates with step sequences
 * Requirements: 7.6, 8.1
 */

/**
 * Workflow template structure
 * @typedef {Object} WorkflowStep
 * @property {string} name - Step name
 * @property {string} description - Step description
 * @property {Array<string>} required_fields - Required form fields
 * @property {string} ui_hint - Hint for UI generation
 */

/**
 * @typedef {Object} WorkflowTemplate
 * @property {string} name - Workflow name
 * @property {string} description - Workflow description
 * @property {Array<WorkflowStep>} steps - Workflow steps
 */

/**
 * Example workflow templates
 */
export const WORKFLOW_TEMPLATES = {
  createInstance: {
    name: 'Create Instance',
    description: 'Multi-step workflow for creating a new resource instance',
    steps: [
      {
        name: 'Basic Information',
        description: 'Collect basic instance information',
        required_fields: ['name', 'type'],
        ui_hint: 'Form with text input for name and select for type'
      },
      {
        name: 'Configuration',
        description: 'Configure instance settings',
        required_fields: ['size', 'region'],
        ui_hint: 'Form with select dropdowns for size and region options'
      },
      {
        name: 'Confirmation',
        description: 'Review and confirm instance creation',
        required_fields: [],
        ui_hint: 'Summary display with confirm button'
      }
    ]
  },
  
  userRegistration: {
    name: 'User Registration',
    description: 'Multi-step user registration workflow',
    steps: [
      {
        name: 'Account Details',
        description: 'Collect user account information',
        required_fields: ['email', 'username'],
        ui_hint: 'Form with email and username text inputs'
      },
      {
        name: 'Profile Setup',
        description: 'Set up user profile',
        required_fields: ['displayName'],
        ui_hint: 'Form with display name and optional bio'
      },
      {
        name: 'Preferences',
        description: 'Configure user preferences',
        required_fields: ['notifications'],
        ui_hint: 'Checkboxes for notification preferences'
      }
    ]
  },

  dataQuery: {
    name: 'Data Query',
    description: 'Single-step data query workflow',
    steps: [
      {
        name: 'Query Parameters',
        description: 'Specify query parameters',
        required_fields: ['query'],
        ui_hint: 'Text input for query with optional filters'
      }
    ]
  }
};

/**
 * Generate workflow prompt section
 * @param {Object} templates - Workflow templates object
 * @returns {string}
 */
function generateWorkflowPrompt(templates) {
  const workflowDescriptions = Object.entries(templates).map(([key, workflow]) => {
    const stepsDescription = workflow.steps.map((step, index) => {
      const fields = step.required_fields.length > 0 
        ? step.required_fields.join(', ') 
        : 'none';
      return `  Step ${index + 1}: ${step.name}
    - Description: ${step.description}
    - Required fields: ${fields}
    - UI hint: ${step.ui_hint}`;
    }).join('\n');

    return `### ${workflow.name}
${workflow.description}

${stepsDescription}`;
  }).join('\n\n');

  return `## Workflow Templates

When handling multi-step tasks, follow these workflow patterns:

${workflowDescriptions}

## Workflow Guidelines
1. Track current step in the workflow
2. Validate required fields before proceeding to next step
3. Allow users to go back to previous steps when appropriate
4. Show progress indication for multi-step workflows
5. Display summary before final confirmation
6. Handle errors at each step gracefully`;
}

/**
 * Get the workflows prompt
 * @returns {string}
 */
export function getPrompt() {
  return generateWorkflowPrompt(WORKFLOW_TEMPLATES);
}

/**
 * Get a specific workflow template
 * @param {string} workflowName - Name of the workflow
 * @returns {WorkflowTemplate|null}
 */
export function getWorkflow(workflowName) {
  return WORKFLOW_TEMPLATES[workflowName] || null;
}

/**
 * Get all workflow names
 * @returns {Array<string>}
 */
export function getWorkflowNames() {
  return Object.keys(WORKFLOW_TEMPLATES);
}

/**
 * Register a custom workflow template
 * @param {string} name - Workflow identifier
 * @param {WorkflowTemplate} template - Workflow template
 */
export function registerWorkflow(name, template) {
  if (!template.name || !template.steps || !Array.isArray(template.steps)) {
    throw new Error('Invalid workflow template: must have name and steps array');
  }
  WORKFLOW_TEMPLATES[name] = template;
}

export default {
  getPrompt,
  getWorkflow,
  getWorkflowNames,
  registerWorkflow,
  WORKFLOW_TEMPLATES
};
