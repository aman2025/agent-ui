'use client';

import * as React from 'react';
import { Send, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VM2Renderer } from '@/components/vm2/Renderer';
import useAgentStore from '@/store/agentStore';

/**
 * Main Page Component
 * Implements the AI Agent Dynamic UI interface
 * 
 * Requirements:
 * - 10.1: Default view with input field and send button
 * - 10.2: Replace default view with agent-generated UI
 * - 10.3: Replace previous UI with new UI during workflow
 * - 10.4: Allow returning to default view after workflow completion
 * - 10.5: Display loading indicator while processing
 */
export default function Home() {
  const [query, setQuery] = React.useState('');
  // Track agent context for workflow continuity (Requirement 12.5)
  const [agentContext, setAgentContext] = React.useState({});
  
  // Zustand store state and actions
  const currentUI = useAgentStore((state) => state.currentUI);
  const formValues = useAgentStore((state) => state.formValues);
  const isLoading = useAgentStore((state) => state.isLoading);
  const setUI = useAgentStore((state) => state.setUI);
  const setFormValue = useAgentStore((state) => state.setFormValue);
  const setLoading = useAgentStore((state) => state.setLoading);
  const addToHistory = useAgentStore((state) => state.addToHistory);
  const resetToDefault = useAgentStore((state) => state.resetToDefault);

  /**
   * Handle query submission (Requirement 10.1)
   * Sends user query to agent API and updates UI with response
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim() || isLoading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(),
          context: agentContext
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.ui) {
        // Replace default view with agent-generated UI (Requirement 10.2)
        setUI(data.ui);
        // Update context for workflow continuity (Requirement 12.5)
        if (data.context) {
          setAgentContext(data.context);
        }
        addToHistory({ type: 'query', query: query.trim(), response: data });
      } else if (!data.success && data.error) {
        console.error('Agent error:', data.error);
      }
      
      setQuery('');
    } catch (error) {
      console.error('Failed to submit query:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form value changes from VM2 components
   * Updates Zustand store with new values
   */
  const handleValueChange = (path, value) => {
    setFormValue(path, value);
  };

  /**
   * Handle button actions from VM2 components (Requirement 10.3)
   * Submits form data with action_id to agent API
   */
  const handleAction = async (actionId) => {
    if (isLoading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: actionId,
          formData: formValues,
          context: agentContext
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.ui) {
        // Replace previous UI with new UI (Requirement 10.3)
        setUI(data.ui);
        // Update context for workflow continuity (Requirement 12.5)
        if (data.context) {
          setAgentContext(data.context);
        }
        addToHistory({ type: 'action', actionId, formData: formValues, response: data });
      } else if (!data.success && data.error) {
        console.error('Agent error:', data.error);
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle reset to default view (Requirement 10.4)
   * Clears state and returns to input view
   */
  const handleReset = () => {
    resetToDefault();
    setAgentContext({});
    setQuery('');
  };

  // Render dynamic view when agent has generated UI (Requirement 10.2, 10.3)
  if (currentUI) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>AI Agent</CardTitle>
              <CardDescription>Complete the form below</CardDescription>
            </div>
            {/* Reset button (Requirement 10.4) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </CardHeader>
          <CardContent className="relative">
            {/* Loading overlay (Requirement 10.5) */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {/* VM2 Renderer for dynamic UI */}
            <VM2Renderer
              structure={currentUI}
              formValues={formValues}
              onValueChange={handleValueChange}
              onAction={handleAction}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render default view with input field and send button (Requirement 10.1)
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">AI Agent Dynamic UI</CardTitle>
          <CardDescription>
            Ask me anything and I'll generate an interactive UI to help you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="What would you like to do?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ml-2 sr-only sm:not-sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
