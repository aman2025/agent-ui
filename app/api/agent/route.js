/**
 * Agent API Route
 * Requirements: 12.1, 12.2, 12.4
 * 
 * Handles:
 * - POST for user queries (returns VM2 component structures)
 * - POST for form submissions with action_id
 */

import { NextResponse } from 'next/server';
import { ReActAgent } from '@/lib/agent/react.js';
import { MistralClient } from '@/lib/llm/client.js';
import { PromptComposer } from '@/lib/prompts/composer.js';
import { ActionRouter } from '@/lib/tools/router.js';
import toolRegistry from '@/lib/tools/registry.js';
import { registerAllTools } from '@/lib/tools/definitions/index.js';

// Register all tools on module load
let toolsRegistered = false;

function ensureToolsRegistered() {
  if (!toolsRegistered) {
    try {
      registerAllTools();
      toolsRegistered = true;
    } catch (error) {
      // Tools may already be registered, ignore duplicate registration errors
      if (!error.message?.includes('already registered')) {
        throw error;
      }
      toolsRegistered = true;
    }
  }
}

/**
 * Create agent instance with all dependencies
 * @returns {ReActAgent}
 */
function createAgent() {
  ensureToolsRegistered();
  
  const llmClient = new MistralClient();
  const promptComposer = new PromptComposer({ toolRegistry });
  const router = new ActionRouter(toolRegistry);
  
  return new ReActAgent(llmClient, promptComposer, router);
}

/**
 * Validate request body for user query
 * @param {Object} body - Request body
 * @returns {{ valid: boolean, error?: string }}
 */
function validateQueryRequest(body) {
  if (!body.query || typeof body.query !== 'string') {
    return { valid: false, error: 'Missing or invalid query field' };
  }
  if (body.query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }
  return { valid: true };
}

/**
 * Validate request body for form submission
 * @param {Object} body - Request body
 * @returns {{ valid: boolean, error?: string }}
 */
function validateActionRequest(body) {
  if (!body.action_id || typeof body.action_id !== 'string') {
    return { valid: false, error: 'Missing or invalid action_id field' };
  }
  if (body.formData && typeof body.formData !== 'object') {
    return { valid: false, error: 'formData must be an object' };
  }
  return { valid: true };
}

/**
 * POST handler for agent interactions
 * Handles both user queries and form submissions
 */
export async function POST(request) {
  console.log('[DEBUG] API Route - Request received at:', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('[DEBUG] API Route - Body parsed:', JSON.stringify(body, null, 2));
    
    // Determine request type based on presence of action_id
    const isFormSubmission = 'action_id' in body;
    
    if (isFormSubmission) {
      // Handle form submission with action_id
      const validation = validateActionRequest(body);
      if (!validation.valid) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: validation.error 
            } 
          },
          { status: 400 }
        );
      }
      
      const agent = createAgent();
      const context = body.context || {};
      const formData = body.formData || {};
      
      const response = await agent.processAction(body.action_id, formData, context);
      
      // Build dataModel from tool execution result for path-based bindings
      // Structure: { data: {...}, success, error, metadata }
      // LLM uses paths like "data.instances" to access the data
      const dataModel = response.toolResult || undefined

      return NextResponse.json({
        success: true,
        type: response.type,
        ui: response.ui,
        context: response.context,
        dataModel
      });
      
    } else {
      // Handle user query
      const validation = validateQueryRequest(body);
      if (!validation.valid) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: validation.error 
            } 
          },
          { status: 400 }
        );
      }
      
      console.log('[DEBUG] API Route - Creating agent...');
      const agent = createAgent();
      console.log('[DEBUG] API Route - Agent created, processing query...');
      const context = body.context || {};
      
      const startTime = Date.now();
      const response = await agent.process(body.query, context);
      console.log('[DEBUG] API Route - Agent process completed in', Date.now() - startTime, 'ms');
      
      return NextResponse.json({
        success: true,
        type: response.type,
        ui: response.ui,
        context: response.context
      });
    }
    
  } catch (error) {
    console.error('Agent API error:', error);
    
    // Handle specific error types
    if (error.code === 'MISSING_API_KEY') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'CONFIGURATION_ERROR', 
            message: 'LLM API key not configured' 
          } 
        },
        { status: 500 }
      );
    }
    
    if (error.code === 'RATE_LIMITED') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'RATE_LIMITED', 
            message: 'Rate limit exceeded, please try again later',
            details: error.details
          } 
        },
        { status: 429 }
      );
    }
    
    if (error.code === 'LLM_CONNECTION') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'LLM_CONNECTION', 
            message: 'Failed to connect to LLM service',
            details: error.details
          } 
        },
        { status: 502 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error.message || 'An unexpected error occurred' 
        } 
      },
      { status: 500 }
    );
  }
}
