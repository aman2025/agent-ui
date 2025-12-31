import { create } from 'zustand';

/**
 * Zustand store for application state management
 * 
 * Manages:
 * - currentUI: The current VM2 component structure being rendered
 * - formValues: Form field values bound to component paths
 * - dataModel: Reactive data model for path-based bindings (like A2UI's dataModelUpdate)
 * - history: Conversation/workflow history
 * - isLoading: Loading state during API requests
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
const useAgentStore = create((set, get) => ({
  // Current UI component structure (Requirement 9.1)
  currentUI: null,

  // Form values bound to paths (Requirement 9.2)
  formValues: {},

  // Data model for reactive path-based bindings
  // Stores tool execution results and other dynamic data
  dataModel: {},

  // Workflow context: conversation history and API responses (Requirement 9.4)
  history: [],

  // Loading state for async operations
  isLoading: false,

  /**
   * Set the current UI structure
   * Clears previous form values when UI is replaced (Requirement 9.5)
   * Preserves dataModel for data continuity
   * @param {Object|null} ui - VM2 component structure or null
   */
  setUI: (ui) => set({ 
    currentUI: ui, 
    formValues: {} 
  }),

  /**
   * Update the data model (similar to A2UI's dataModelUpdate)
   * Merges new data into existing model for reactive updates
   * @param {Object} data - Data to merge into the model
   */
  updateDataModel: (data) => set((state) => ({
    dataModel: {
      ...state.dataModel,
      ...data
    }
  })),

  /**
   * Set a specific path in the data model
   * @param {string} path - Dot-notation path
   * @param {any} value - Value to set
   */
  setDataModelValue: (path, value) => set((state) => {
    const newModel = { ...state.dataModel }
    const parts = path.split('.')
    let current = newModel

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!(part in current)) {
        current[part] = {}
      }
      current = current[part]
    }

    current[parts[parts.length - 1]] = value
    return { dataModel: newModel }
  }),

  /**
   * Clear the data model
   */
  clearDataModel: () => set({ dataModel: {} }),

  /**
   * Update a form field value at the specified path (Requirement 9.3)
   * @param {string} path - The state binding path
   * @param {any} value - The new value
   */
  setFormValue: (path, value) => set((state) => ({
    formValues: { 
      ...state.formValues, 
      [path]: value 
    }
  })),

  /**
   * Set loading state
   * @param {boolean} loading - Whether the app is loading
   */
  setLoading: (loading) => set({ isLoading: loading }),

  /**
   * Add an entry to the conversation history (Requirement 9.4)
   * @param {Object} entry - History entry with timestamp and data
   */
  addToHistory: (entry) => set((state) => ({
    history: [
      ...state.history, 
      { 
        timestamp: Date.now(), 
        ...entry 
      }
    ]
  })),

  /**
   * Reset store to default state
   * Used when returning to default view or starting fresh
   */
  resetToDefault: () => set({ 
    currentUI: null, 
    formValues: {}, 
    dataModel: {},
    history: [] 
  }),

  /**
   * Get a form value by path
   * @param {string} path - The state binding path
   * @returns {any} The value at the path
   */
  getFormValue: (path) => get().formValues[path],

  /**
   * Get all form values
   * @returns {Object} All form values
   */
  getAllFormValues: () => get().formValues
}));

export default useAgentStore;
