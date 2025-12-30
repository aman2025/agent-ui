'use client';

import * as React from 'react';
import { getComponentType } from '@/lib/vm2/schema';
import { isWhitelisted } from '@/lib/vm2/catalog';

// Import VM2 components
import { TextInput } from './TextInput';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { Text } from './Text';
import { Alert } from './Alert';
import { Table } from './Table';
import { Button } from './Button';

/**
 * Component registry mapping types to React components
 */
const ComponentRegistry = {
  TextInput,
  Select,
  Checkbox,
  Text,
  Alert,
  Table,
  Button
};

/**
 * Build a map of component IDs to their definitions
 * @param {Array} components - Flat list of component entries
 * @returns {Map<string, Object>}
 */
function buildComponentMap(components) {
  const map = new Map();
  
  for (const entry of components) {
    const type = getComponentType(entry.component);
    map.set(entry.id, {
      id: entry.id,
      type,
      props: entry.component[type]
    });
  }
  
  return map;
}

/**
 * Render a single component
 * @param {Object} componentDef - Component definition { id, type, props }
 * @param {Map} componentMap - Map of all components by ID
 * @param {Object} formValues - Current form values from state
 * @param {Function} onValueChange - Callback for form value changes
 * @param {Function} onAction - Callback for button actions
 * @returns {React.ReactElement | null}
 */
function renderComponent(componentDef, componentMap, formValues, onValueChange, onAction) {
  const { id, type, props } = componentDef;
  
  // Check if component type is whitelisted
  if (!isWhitelisted(type)) {
    console.warn(`Unknown component type: ${type}`);
    return null;
  }
  
  const Component = ComponentRegistry[type];
  if (!Component) {
    console.warn(`Component not found in registry: ${type}`);
    return null;
  }
  
  // Build component props based on type
  const componentProps = { ...props, key: id };
  
  // Handle form components - bind values to state
  if (['TextInput', 'Select', 'Checkbox'].includes(type)) {
    const path = props.value?.path;
    if (path) {
      componentProps.currentValue = formValues[path] ?? (type === 'Checkbox' ? false : '');
      componentProps.onValueChange = onValueChange;
    }
  }
  
  // Handle Table component - bind data to state
  if (type === 'Table') {
    const path = props.data?.path;
    if (path) {
      componentProps.currentData = formValues[path] ?? [];
    }
  }
  
  // Handle Button component - resolve child reference and attach action handler
  if (type === 'Button') {
    componentProps.onAction = onAction;
    
    // Resolve child reference if present
    if (props.child) {
      const childDef = componentMap.get(props.child);
      if (childDef) {
        componentProps.childComponent = renderComponent(
          childDef,
          componentMap,
          formValues,
          onValueChange,
          onAction
        );
      }
    }
  }
  
  return <Component {...componentProps} />;
}

/**
 * VM2 Renderer Component
 * Renders VM2 component structure as React components
 * Requirements: 4.1, 4.5
 * 
 * @param {Object} props
 * @param {Object} props.structure - Validated VM2 structure with surfaceUpdate
 * @param {Object} props.formValues - Current form values from Zustand store
 * @param {Function} props.onValueChange - Callback when form value changes (path, value)
 * @param {Function} props.onAction - Callback when button action is triggered (actionId)
 */
export function VM2Renderer({ structure, formValues = {}, onValueChange, onAction }) {
  // Validate structure
  if (!structure?.surfaceUpdate?.components) {
    return null;
  }
  
  const { components } = structure.surfaceUpdate;
  
  // Build component map for reference resolution
  const componentMap = buildComponentMap(components);
  
  // Track which components are rendered as children (to avoid duplicate rendering)
  const childIds = new Set();
  for (const entry of components) {
    const type = getComponentType(entry.component);
    const props = entry.component[type];
    if (type === 'Button' && props.child) {
      childIds.add(props.child);
    }
  }
  
  // Render top-level components (not referenced as children)
  const renderedComponents = components
    .filter(entry => !childIds.has(entry.id))
    .map(entry => {
      const type = getComponentType(entry.component);
      const componentDef = {
        id: entry.id,
        type,
        props: entry.component[type]
      };
      
      return renderComponent(
        componentDef,
        componentMap,
        formValues,
        onValueChange,
        onAction
      );
    })
    .filter(Boolean);
  
  return (
    <div className="space-y-4">
      {renderedComponents}
    </div>
  );
}

export default VM2Renderer;
