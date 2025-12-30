/**
 * VM2 Component Catalog
 * Provides whitelist validation and component lookup functions
 * Requirements: 3.1, 3.4
 */

import { COMPONENT_WHITELIST } from './schema.js';

/**
 * Component catalog mapping types to React component imports
 * Components are lazily loaded to avoid circular dependencies
 */
const ComponentCatalog = {
  TextInput: null,
  Select: null,
  Checkbox: null,
  Text: null,
  Alert: null,
  Table: null,
  Button: null
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
 * Get React component for a given type
 * @param {string} type - Component type
 * @returns {React.Component | null}
 */
export function getComponent(type) {
  if (!isWhitelisted(type)) {
    return null;
  }
  return ComponentCatalog[type] || null;
}

/**
 * Register a React component in the catalog
 * @param {string} type - Component type
 * @param {React.Component} component - React component to register
 */
export function registerComponent(type, component) {
  if (!isWhitelisted(type)) {
    throw new Error(`Cannot register unknown component type: ${type}`);
  }
  ComponentCatalog[type] = component;
}

/**
 * Get all registered component types
 * @returns {string[]}
 */
export function getRegisteredTypes() {
  return Object.keys(ComponentCatalog).filter(type => ComponentCatalog[type] !== null);
}

/**
 * Check if a component type is registered
 * @param {string} type - Component type
 * @returns {boolean}
 */
export function isRegistered(type) {
  return ComponentCatalog[type] !== null;
}

/**
 * Get the whitelist of allowed component types
 * @returns {string[]}
 */
export function getWhitelist() {
  return [...COMPONENT_WHITELIST];
}

export { ComponentCatalog };
