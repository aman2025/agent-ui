/**
 * UI Schema Prompt - Component whitelist and type definitions
 * Requirements: 7.4
 */

import { COMPONENT_WHITELIST, ComponentPropertySchemas } from '../vm2/schema.js';

/**
 * UI Schema prompt defining available components and their properties
 */
const UI_SCHEMA_PROMPT = `## Available UI Components

You can ONLY use the following component types. Any other component type will be rejected.

### Form Components

#### TextInput
A text input field for user text entry.
\`\`\`json
{
  "TextInput": {
    "value": { "path": "formValues.fieldName" },
    "placeholder": "Enter text here...",
    "label": "Field Label",
    "required": true
  }
}
\`\`\`
Properties:
- value.path (string): State binding path for the input value
- placeholder (string, optional): Placeholder text
- label (string, optional): Label displayed above the input
- required (boolean, optional): Whether the field is required

#### Select
A dropdown selection component.
\`\`\`json
{
  "Select": {
    "value": { "path": "formValues.selection" },
    "options": [
      { "value": "opt1", "label": "Option 1" },
      { "value": "opt2", "label": "Option 2" }
    ],
    "label": "Select an option",
    "required": true
  }
}
\`\`\`
Properties:
- value.path (string): State binding path
- options (array, required): Array of { value, label } objects
- label (string, optional): Label for the select
- required (boolean, optional): Whether selection is required

#### Checkbox
A checkbox for boolean input.
\`\`\`json
{
  "Checkbox": {
    "value": { "path": "formValues.agreed" },
    "label": "I agree to the terms"
  }
}
\`\`\`
Properties:
- value.path (string): State binding path
- label (string, optional): Label displayed next to checkbox

### Display Components

#### Text
A text display component with semantic hints.
\`\`\`json
{
  "Text": {
    "text": { "literalString": "Welcome to the form" },
    "usageHint": "h1"
  }
}
\`\`\`
Properties:
- text.literalString (string, required): The text content to display
- usageHint (string, optional): Semantic hint - one of: "h1", "h2", "h3", "p", "span"

#### Alert
A notification/alert component for feedback.
\`\`\`json
{
  "Alert": {
    "type": "success",
    "title": "Success!",
    "message": "Your action was completed successfully."
  }
}
\`\`\`
Properties:
- type (string, required): One of: "success", "error", "warning", "info"
- title (string, optional): Alert title
- message (string, required): Alert message content

#### Table
A data table for displaying structured data.
\`\`\`json
{
  "Table": {
    "columns": [
      { "key": "name", "label": "Name" },
      { "key": "value", "label": "Value" }
    ],
    "data": { "path": "tableData" }
  }
}
\`\`\`
Properties:
- columns (array, required): Array of { key, label } column definitions
- data.path (string, optional): State path to data array

### Action Components

#### Button
A button that triggers actions.
\`\`\`json
{
  "Button": {
    "child": "button-text-id",
    "action": { "name": "submit_form" },
    "variant": "primary"
  }
}
\`\`\`
Properties:
- child (string, optional): ID reference to a Text component for button label
- action.name (string, required): The action_id to trigger on click
- variant (string, optional): One of: "primary", "secondary", "destructive"

## Component Whitelist
Only these component types are allowed: ${COMPONENT_WHITELIST.join(', ')}`;

/**
 * Get the UI schema prompt
 * @returns {string}
 */
export function getPrompt() {
  return UI_SCHEMA_PROMPT;
}

/**
 * Get component whitelist as formatted string
 * @returns {string}
 */
export function getWhitelistString() {
  return COMPONENT_WHITELIST.join(', ');
}

/**
 * Get property schema for a specific component type
 * @param {string} componentType - The component type
 * @returns {Object|null}
 */
export function getComponentSchema(componentType) {
  return ComponentPropertySchemas[componentType] || null;
}

export default {
  getPrompt,
  getWhitelistString,
  getComponentSchema
};
