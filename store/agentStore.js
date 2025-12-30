import { create } from 'zustand';

/**
 * Zustand store for application state management
 * 
 * Manages:
 * - currentUI: The current VM2 component structure being rendered
 * - formValues: Form field values bound to component paths
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

  // Workflow context: conversation history and API responses (Requirement 9.4)
  history: [],

  // Loading state for async operations
  isLoading: false,

  /**
   * Set the current UI structure
   * Clears previous form values when UI is replaced (Requirement 9.5)
   * @param {Object|null} ui - VM2 component structure or null
   */
  setUI: (ui) => set({ 
    currentUI: ui, 
    formValues: {} 
  }),

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
