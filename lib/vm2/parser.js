/**
 * VM2 Parser
 * Parses and validates LLM JSON responses into VM2 component structures
 * Requirements: 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.5
 */

import {
  COMPONENT_WHITELIST,
  isWhitelisted,
  getComponentType,
  validateSurfaceUpdateStructure,
  validateComponentEntry
} from './schema.js';

/**
 * Patterns that indicate potentially dangerous script-like content
 */
const DANGEROUS_PATTERNS = [
  /javascript:/i,
  /\bon[a-z]+\s*=/i,      // onclick=, onload=, etc. (must start with word boundary)
  /<script/i,
  /<\/script/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
  /setTimeout\s*\(/i,
  /setInterval\s*\(/i,
  /\bdocument\./i,        // document. (must start with word boundary)
  /\bwindow\./i,          // window. (must start with word boundary)
  /innerHTML/i,
  /outerHTML/i,
  /\.prototype\b/i,       // .prototype (must end with word boundary)
  /__proto__/i,
  /constructor\s*\[/i
];

/**
 * Check if a string contains potentially dangerous content
 * @param {string} str - String to check
 * @returns {{ safe: boolean, reason?: string }}
 */
function checkForDangerousContent(str) {
  if (typeof str !== 'string') {
    return { safe: true };
  }
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(str)) {
      return {
        safe: false,
        reason: `Potentially dangerous pattern detected: ${pattern.toString()}`
      };
    }
  }
  
  return { safe: true };
}

/**
 * Recursively check an object for dangerous content
 * @param {any} obj - Object to check
 * @param {string} path - Current path for error reporting
 * @returns {{ safe: boolean, error?: { code: string, message: string, details: Object } }}
 */
function checkObjectForDangerousContent(obj, path = '') {
  if (typeof obj === 'string') {
    const check = checkForDangerousContent(obj);
    if (!check.safe) {
      console.log('[DEBUG] Security check failed:');
      console.log('[DEBUG] - Path:', path);
      console.log('[DEBUG] - Content:', obj);
      console.log('[DEBUG] - Reason:', check.reason);
      return {
        safe: false,
        error: {
          code: 'SECURITY_VIOLATION',
          message: 'Potentially dangerous content detected',
          details: { content: obj.substring(0, 100), reason: check.reason, path }
        }
      };
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = checkObjectForDangerousContent(obj[i], `${path}[${i}]`);
      if (!result.safe) {
        return result;
      }
    }
  } else if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const result = checkObjectForDangerousContent(obj[key], path ? `${path}.${key}` : key);
      if (!result.safe) {
        return result;
      }
    }
  }
  
  return { safe: true };
}


/**
 * Validate component type against whitelist
 * @param {Object} component - Component definition
 * @param {string} componentId - Component ID for error reporting
 * @returns {{ valid: boolean, type?: string, error?: { code: string, message: string, details: Object } }}
 */
function validateComponentType(component, componentId) {
  const type = getComponentType(component);
  
  if (!type) {
    return {
      valid: false,
      error: {
        code: 'SCHEMA_INVALID',
        message: `Component ${componentId} has invalid structure`,
        details: { componentId }
      }
    };
  }
  
  if (!isWhitelisted(type)) {
    return {
      valid: false,
      error: {
        code: 'UNKNOWN_COMPONENT',
        message: `Component type ${type} not allowed`,
        details: { type, allowed: COMPONENT_WHITELIST }
      }
    };
  }
  
  return { valid: true, type };
}

/**
 * Parse JSON string into VM2 structure with validation
 * @param {string} jsonString - Raw JSON from LLM
 * @returns {{ success: boolean, data?: Object, error?: { code: string, message: string, details?: Object } }}
 */
export function parse(jsonString) {
  // Step 1: Parse JSON
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    const position = e.message.match(/position (\d+)/)?.[1] || 'unknown';
    return {
      success: false,
      error: {
        code: 'JSON_SYNTAX',
        message: `Invalid JSON at position ${position}`,
        details: { position, originalError: e.message }
      }
    };
  }
  
  // Step 2: Validate against schema structure
  const structureValidation = validateSurfaceUpdateStructure(data);
  if (!structureValidation.valid) {
    return {
      success: false,
      error: structureValidation.error
    };
  }
  
  // Step 3: Security check for dangerous content
  const securityCheck = checkObjectForDangerousContent(data);
  if (!securityCheck.safe) {
    return {
      success: false,
      error: securityCheck.error
    };
  }
  
  // Step 4: Validate each component
  const { components } = data.surfaceUpdate;
  const componentIds = new Set();
  
  for (let i = 0; i < components.length; i++) {
    const entry = components[i];
    
    // Validate entry structure
    const entryValidation = validateComponentEntry(entry, i);
    if (!entryValidation.valid) {
      return {
        success: false,
        error: entryValidation.error
      };
    }
    
    // Check for duplicate IDs
    if (componentIds.has(entry.id)) {
      return {
        success: false,
        error: {
          code: 'SCHEMA_INVALID',
          message: `Duplicate component ID: ${entry.id}`,
          details: { id: entry.id, index: i }
        }
      };
    }
    componentIds.add(entry.id);
    
    // Validate component type against whitelist
    const typeValidation = validateComponentType(entry.component, entry.id);
    if (!typeValidation.valid) {
      return {
        success: false,
        error: typeValidation.error
      };
    }
  }
  
  // Step 5: Resolve and validate references
  const referenceValidation = resolveReferences(data, componentIds);
  if (!referenceValidation.valid) {
    return {
      success: false,
      error: referenceValidation.error
    };
  }
  
  return {
    success: true,
    data
  };
}

/**
 * Format VM2 structure back to JSON string
 * Ensures consistent ordering for round-trip consistency
 * @param {Object} structure - Validated VM2 structure
 * @returns {string}
 */
export function print(structure) {
  // Create a normalized structure with consistent key ordering
  const normalized = {
    surfaceUpdate: {
      surfaceId: structure.surfaceUpdate.surfaceId,
      components: structure.surfaceUpdate.components.map(entry => ({
        id: entry.id,
        component: normalizeComponent(entry.component)
      }))
    }
  };
  
  return JSON.stringify(normalized, null, 2);
}

/**
 * Normalize component for consistent serialization
 * @param {Object} component - Component definition
 * @returns {Object}
 */
function normalizeComponent(component) {
  const type = getComponentType(component);
  if (!type) return component;
  
  const props = component[type];
  const sortedProps = {};
  
  // Sort keys alphabetically for consistency
  Object.keys(props).sort().forEach(key => {
    sortedProps[key] = props[key];
  });
  
  return { [type]: sortedProps };
}


/**
 * Resolve and validate component references
 * Checks that all child references point to existing component IDs
 * Requirements: 2.6
 * @param {Object} data - Parsed VM2 structure
 * @param {Set<string>} componentIds - Set of all valid component IDs
 * @returns {{ valid: boolean, error?: { code: string, message: string, details: Object } }}
 */
export function resolveReferences(data, componentIds) {
  const { components } = data.surfaceUpdate;
  
  for (const entry of components) {
    const type = getComponentType(entry.component);
    const props = entry.component[type];
    
    // Check for child reference in Button components
    if (type === 'Button' && props.child) {
      if (!componentIds.has(props.child)) {
        return {
          valid: false,
          error: {
            code: 'INVALID_REFERENCE',
            message: `Component ${entry.id} references non-existent ID ${props.child}`,
            details: { componentId: entry.id, referencedId: props.child }
          }
        };
      }
    }
    
    // Check for any other reference fields that might exist
    // This handles potential future reference types
    if (props.ref && typeof props.ref === 'string') {
      if (!componentIds.has(props.ref)) {
        return {
          valid: false,
          error: {
            code: 'INVALID_REFERENCE',
            message: `Component ${entry.id} references non-existent ID ${props.ref}`,
            details: { componentId: entry.id, referencedId: props.ref }
          }
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Build a map of component IDs to their definitions for easy lookup
 * @param {Object} data - Parsed VM2 structure
 * @returns {Map<string, Object>}
 */
export function buildComponentMap(data) {
  const map = new Map();
  
  for (const entry of data.surfaceUpdate.components) {
    map.set(entry.id, {
      id: entry.id,
      type: getComponentType(entry.component),
      props: entry.component[getComponentType(entry.component)]
    });
  }
  
  return map;
}

/**
 * Get all component IDs from a VM2 structure
 * @param {Object} data - Parsed VM2 structure
 * @returns {Set<string>}
 */
export function getComponentIds(data) {
  const ids = new Set();
  
  if (data?.surfaceUpdate?.components) {
    for (const entry of data.surfaceUpdate.components) {
      if (entry.id) {
        ids.add(entry.id);
      }
    }
  }
  
  return ids;
}

/**
 * Resolve a child reference to its component definition
 * @param {string} childId - The ID of the child component
 * @param {Map<string, Object>} componentMap - Map of all components
 * @returns {Object|null} - The resolved component or null if not found
 */
export function resolveChildReference(childId, componentMap) {
  return componentMap.get(childId) || null;
}
