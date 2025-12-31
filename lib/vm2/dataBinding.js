/**
 * Data Binding Utilities for VM2 Components
 * Implements path-based data resolution similar to A2UI's dataModelUpdate
 * 
 * Supports:
 * - Path resolution: "toolExecutionResult.data.instances"
 * - Literal strings: { literalString: "Hello" }
 * - Nested object access with dot notation
 */

/**
 * Resolve a path string to a value in the data model
 * @param {string} path - Dot-notation path (e.g., "toolExecutionResult.data.instances")
 * @param {Object} dataModel - The data model object
 * @returns {any} The resolved value or undefined
 */
export function resolvePath(path, dataModel) {
  if (!path || typeof path !== 'string' || !dataModel) {
    return undefined
  }

  const parts = path.split('.')
  let current = dataModel

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }

    // Handle array index notation: items[0]
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/)
    if (arrayMatch) {
      const [, key, index] = arrayMatch
      current = current[key]?.[parseInt(index, 10)]
    } else {
      current = current[part]
    }
  }

  return current
}

/**
 * Resolve a value binding object
 * Handles both path references and literal values
 * 
 * @param {Object|string|any} binding - The binding definition
 *   - { path: "some.path" } - Resolve from data model
 *   - { literalString: "Hello" } - Use literal value
 *   - string/other - Return as-is
 * @param {Object} dataModel - The data model object
 * @returns {any} The resolved value
 */
export function resolveBinding(binding, dataModel) {
  if (!binding) {
    return undefined
  }

  // Handle path binding: { path: "toolExecutionResult.data.instances" }
  if (typeof binding === 'object' && binding.path) {
    return resolvePath(binding.path, dataModel)
  }

  // Handle literal string: { literalString: "Hello World" }
  if (typeof binding === 'object' && binding.literalString !== undefined) {
    return binding.literalString
  }

  // Return primitive values as-is
  return binding
}

/**
 * Check if a value is a path binding object
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export function isPathBinding(value) {
  return value && typeof value === 'object' && typeof value.path === 'string'
}

/**
 * Check if a value is a literal binding object
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export function isLiteralBinding(value) {
  return value && typeof value === 'object' && value.literalString !== undefined
}

/**
 * Extract all path bindings from a component props object
 * Useful for debugging and validation
 * @param {Object} props - Component props
 * @returns {Array<{key: string, path: string}>}
 */
export function extractPathBindings(props) {
  const bindings = []

  function traverse(obj, prefix = '') {
    if (!obj || typeof obj !== 'object') return

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (isPathBinding(value)) {
        bindings.push({ key: fullKey, path: value.path })
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        traverse(value, fullKey)
      }
    }
  }

  traverse(props)
  return bindings
}

export default {
  resolvePath,
  resolveBinding,
  isPathBinding,
  isLiteralBinding,
  extractPathBindings
}
