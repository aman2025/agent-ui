/**
 * VM2 Component Schema Definitions
 * Defines component types, whitelist, and JSON schema structure for surfaceUpdate
 * Requirements: 2.1, 3.1
 */

/**
 * Whitelist of approved component types
 */
export const COMPONENT_WHITELIST = [
  'TextInput',
  'Select',
  'Checkbox',
  'Text',
  'Alert',
  'Table',
  'Button'
];

/**
 * Component type constants
 */
export const ComponentTypes = {
  TEXT_INPUT: 'TextInput',
  SELECT: 'Select',
  CHECKBOX: 'Checkbox',
  TEXT: 'Text',
  ALERT: 'Alert',
  TABLE: 'Table',
  BUTTON: 'Button'
};

/**
 * Component property schemas for validation
 */
export const ComponentPropertySchemas = {
  TextInput: {
    required: [],
    optional: ['value', 'placeholder', 'label', 'required'],
    valueType: { path: 'string' }
  },
  Select: {
    required: ['options'],
    optional: ['value', 'label', 'required'],
    valueType: { path: 'string' },
    optionsType: [{ value: 'string', label: 'string' }]
  },
  Checkbox: {
    required: [],
    optional: ['value', 'label'],
    valueType: { path: 'string' }
  },
  Text: {
    required: ['text'],
    optional: ['usageHint'],
    textType: { literalString: 'string' },
    usageHintValues: ['h1', 'h2', 'h3', 'p', 'span']
  },
  Alert: {
    required: ['type', 'message'],
    optional: ['title'],
    typeValues: ['success', 'error', 'warning', 'info']
  },
  Table: {
    required: ['columns'],
    optional: ['data'],
    columnsType: [{ key: 'string', label: 'string' }],
    dataType: { path: 'string' }
  },
  Button: {
    required: ['action'],
    optional: ['child', 'variant'],
    actionType: { name: 'string' },
    variantValues: ['primary', 'secondary', 'destructive']
  }
};


/**
 * VM2 Surface Update Schema structure
 */
export const SurfaceUpdateSchema = {
  type: 'object',
  required: ['surfaceUpdate'],
  properties: {
    surfaceUpdate: {
      type: 'object',
      required: ['surfaceId', 'components'],
      properties: {
        surfaceId: { type: 'string' },
        components: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'component'],
            properties: {
              id: { type: 'string' },
              component: { type: 'object' }
            }
          }
        }
      }
    }
  }
};

/**
 * Check if a component type is in the whitelist
 * @param {string} type - Component type to check
 * @returns {boolean}
 */
export function isWhitelisted(type) {
  return COMPONENT_WHITELIST.includes(type);
}

/**
 * Get the component type from a component definition
 * @param {Object} component - Component object with single type key
 * @returns {string|null} - Component type or null if invalid
 */
export function getComponentType(component) {
  if (!component || typeof component !== 'object') {
    return null;
  }
  const keys = Object.keys(component);
  if (keys.length !== 1) {
    return null;
  }
  return keys[0];
}

/**
 * Validate basic structure of surfaceUpdate
 * @param {Object} data - Parsed JSON data
 * @returns {{ valid: boolean, error?: { code: string, message: string, details?: Object } }}
 */
export function validateSurfaceUpdateStructure(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: 'Data must be an object',
        details: { received: typeof data }
      }
    };
  }

  if (!data.surfaceUpdate) {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: 'Missing required field: surfaceUpdate',
        details: { field: 'surfaceUpdate', path: 'root' }
      }
    };
  }

  const { surfaceUpdate } = data;

  if (typeof surfaceUpdate !== 'object') {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: 'surfaceUpdate must be an object',
        details: { field: 'surfaceUpdate', received: typeof surfaceUpdate }
      }
    };
  }

  if (typeof surfaceUpdate.surfaceId !== 'string') {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: 'Missing required field: surfaceId',
        details: { field: 'surfaceId', path: 'surfaceUpdate' }
      }
    };
  }

  if (!Array.isArray(surfaceUpdate.components)) {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: 'Missing required field: components',
        details: { field: 'components', path: 'surfaceUpdate' }
      }
    };
  }

  return { valid: true };
}

/**
 * Validate a single component entry structure
 * @param {Object} entry - Component entry with id and component
 * @param {number} index - Index in components array
 * @returns {{ valid: boolean, error?: { code: string, message: string, details?: Object } }}
 */
export function validateComponentEntry(entry, index) {
  if (!entry || typeof entry !== 'object') {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: `Component at index ${index} must be an object`,
        details: { index, received: typeof entry }
      }
    };
  }

  if (typeof entry.id !== 'string' || entry.id.trim() === '') {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: `Component at index ${index} missing required field: id`,
        details: { field: 'id', path: `surfaceUpdate.components[${index}]` }
      }
    };
  }

  if (!entry.component || typeof entry.component !== 'object') {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: `Component at index ${index} missing required field: component`,
        details: { field: 'component', path: `surfaceUpdate.components[${index}]` }
      }
    };
  }

  const componentType = getComponentType(entry.component);
  if (!componentType) {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: `Component at index ${index} has invalid component structure`,
        details: { path: `surfaceUpdate.components[${index}].component` }
      }
    };
  }

  return { valid: true };
}
