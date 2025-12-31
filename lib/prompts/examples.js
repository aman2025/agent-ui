/**
 * Few-Shot Examples - Example responses for LLM guidance
 * Requirements: 7.1
 */

/**
 * Example: Initial form generation for creating an instance
 */
export const EXAMPLE_INITIAL_FORM = {
  description: 'Generate a form for creating a new instance',
  response: {
    surfaceUpdate: {
      surfaceId: 'create-instance-form',
      components: [
        {
          id: 'title',
          component: {
            Text: {
              text: { literalString: 'Create New Instance' },
              usageHint: 'h1'
            }
          }
        },
        {
          id: 'description',
          component: {
            Text: {
              text: { literalString: 'Fill in the details below to create a new instance.' },
              usageHint: 'p'
            }
          }
        },
        {
          id: 'name-input',
          component: {
            TextInput: {
              value: { path: 'formValues.name' },
              placeholder: 'Enter instance name',
              label: 'Instance Name',
              required: true
            }
          }
        },
        {
          id: 'type-select',
          component: {
            Select: {
              value: { path: 'formValues.type' },
              options: [
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' }
              ],
              label: 'Instance Type',
              required: true
            }
          }
        },
        {
          id: 'submit-text',
          component: {
            Text: {
              text: { literalString: 'Create Instance' },
              usageHint: 'span'
            }
          }
        },
        {
          id: 'submit-button',
          component: {
            Button: {
              child: 'submit-text',
              action: { name: 'create_instance' },
              variant: 'primary'
            }
          }
        }
      ]
    }
  }
};

/**
 * Example: Success result display
 */
export const EXAMPLE_SUCCESS_RESULT = {
  description: 'Display success message after instance creation',
  response: {
    surfaceUpdate: {
      surfaceId: 'create-instance-result',
      components: [
        {
          id: 'success-alert',
          component: {
            Alert: {
              type: 'success',
              title: 'Instance Created Successfully',
              message: 'Your new instance "my-instance" has been created and is now running.'
            }
          }
        },
        {
          id: 'details-title',
          component: {
            Text: {
              text: { literalString: 'Instance Details' },
              usageHint: 'h2'
            }
          }
        },
        {
          id: 'details-table',
          component: {
            Table: {
              columns: [
                { key: 'property', label: 'Property' },
                { key: 'value', label: 'Value' }
              ],
              data: { path: 'data.details' }
            }
          }
        },
        {
          id: 'new-button-text',
          component: {
            Text: {
              text: { literalString: 'Create Another' },
              usageHint: 'span'
            }
          }
        },
        {
          id: 'new-button',
          component: {
            Button: {
              child: 'new-button-text',
              action: { name: 'reset_form' },
              variant: 'secondary'
            }
          }
        }
      ]
    }
  }
};

/**
 * Example: List results with table
 */
export const EXAMPLE_LIST_RESULT = {
  description: 'Display list of items in a table after tool execution',
  response: {
    surfaceUpdate: {
      surfaceId: 'list-items-result',
      components: [
        {
          id: 'success-alert',
          component: {
            Alert: {
              type: 'success',
              title: 'Items Retrieved',
              message: 'Found 3 items matching your criteria.'
            }
          }
        },
        {
          id: 'results-title',
          component: {
            Text: {
              text: { literalString: 'Results' },
              usageHint: 'h1'
            }
          }
        },
        {
          id: 'results-table',
          component: {
            Table: {
              columns: [
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'createdAt', label: 'Created' }
              ],
              data: { path: 'data.items' }
            }
          }
        },
        {
          id: 'new-query-text',
          component: {
            Text: {
              text: { literalString: 'New Query' },
              usageHint: 'span'
            }
          }
        },
        {
          id: 'new-query-button',
          component: {
            Button: {
              child: 'new-query-text',
              action: { name: 'reset_form' },
              variant: 'secondary'
            }
          }
        }
      ]
    }
  }
};

/**
 * Example: Error handling UI
 */
export const EXAMPLE_ERROR_UI = {
  description: 'Display error message with retry option',
  response: {
    surfaceUpdate: {
      surfaceId: 'error-display',
      components: [
        {
          id: 'error-alert',
          component: {
            Alert: {
              type: 'error',
              title: 'Creation Failed',
              message: 'Unable to create the instance. Please check your inputs and try again.'
            }
          }
        },
        {
          id: 'retry-text',
          component: {
            Text: {
              text: { literalString: 'Try Again' },
              usageHint: 'span'
            }
          }
        },
        {
          id: 'retry-button',
          component: {
            Button: {
              child: 'retry-text',
              action: { name: 'retry_action' },
              variant: 'primary'
            }
          }
        },
        {
          id: 'cancel-text',
          component: {
            Text: {
              text: { literalString: 'Cancel' },
              usageHint: 'span'
            }
          }
        },
        {
          id: 'cancel-button',
          component: {
            Button: {
              child: 'cancel-text',
              action: { name: 'reset_form' },
              variant: 'secondary'
            }
          }
        }
      ]
    }
  }
};

/**
 * Example: Warning/validation UI
 */
export const EXAMPLE_WARNING_UI = {
  description: 'Display validation warning',
  response: {
    surfaceUpdate: {
      surfaceId: 'validation-warning',
      components: [
        {
          id: 'warning-alert',
          component: {
            Alert: {
              type: 'warning',
              title: 'Missing Information',
              message: 'Please fill in all required fields before submitting.'
            }
          }
        }
      ]
    }
  }
};

/**
 * All examples collection
 */
export const ALL_EXAMPLES = [
  EXAMPLE_INITIAL_FORM,
  EXAMPLE_SUCCESS_RESULT,
  EXAMPLE_LIST_RESULT,
  EXAMPLE_ERROR_UI,
  EXAMPLE_WARNING_UI
];

/**
 * Generate few-shot examples prompt section
 * @returns {string}
 */
export function getPrompt() {
  const examplesText = ALL_EXAMPLES.map((example, index) => {
    return `### Example ${index + 1}: ${example.description}
\`\`\`json
${JSON.stringify(example.response, null, 2)}
\`\`\``;
  }).join('\n\n');

  return `## Few-Shot Examples

Study these examples to understand the expected response format:

${examplesText}

## Key Patterns from Examples
1. Always include a surfaceId that describes the UI purpose
2. Use unique, descriptive IDs for each component
3. Structure forms with title → description → inputs → button
4. For buttons, create a separate Text component and reference it via child
5. Use appropriate Alert types for different feedback scenarios
6. Include both primary and secondary actions when appropriate
7. For Table data binding after tool execution, ALWAYS use path "data.<arrayName>" (e.g., "data.instances", "data.items") - the tool result is structured as { success, data: { ... }, error }`;
}

/**
 * Get a specific example by type
 * @param {'form' | 'success' | 'list' | 'error' | 'warning'} type
 * @returns {Object}
 */
export function getExample(type) {
  const examples = {
    form: EXAMPLE_INITIAL_FORM,
    success: EXAMPLE_SUCCESS_RESULT,
    list: EXAMPLE_LIST_RESULT,
    error: EXAMPLE_ERROR_UI,
    warning: EXAMPLE_WARNING_UI
  };
  return examples[type] || null;
}

export default {
  getPrompt,
  getExample,
  ALL_EXAMPLES,
  EXAMPLE_INITIAL_FORM,
  EXAMPLE_SUCCESS_RESULT,
  EXAMPLE_LIST_RESULT,
  EXAMPLE_ERROR_UI,
  EXAMPLE_WARNING_UI
};
