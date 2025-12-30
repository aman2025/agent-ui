/**
 * Tools API Route
 * Requirements: 12.3, 12.4
 * 
 * Handles tool execution requests and returns structured results
 */

import { NextResponse } from 'next/server';
import toolRegistry from '@/lib/tools/registry.js';
import { ActionRouter } from '@/lib/tools/router.js';
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
 * Validate request body for tool execution
 * @param {Object} body - Request body
 * @returns {{ valid: boolean, error?: string }}
 */
function validateToolRequest(body) {
  if (!body.action_id || typeof body.action_id !== 'string') {
    return { valid: false, error: 'Missing or invalid action_id field' };
  }
  if (body.params && typeof body.params !== 'object') {
    return { valid: false, error: 'params must be an object' };
  }
  return { valid: true };
}

/**
 * POST handler for tool execution
 */
export async function POST(request) {
  try {
    ensureToolsRegistered();
    
    const body = await request.json();
    
    // Validate request
    const validation = validateToolRequest(body);
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
    
    const { action_id, params = {} } = body;
    
    // Create router and execute tool
    const router = new ActionRouter(toolRegistry);
    const result = await router.route(action_id, params);
    
    // Return appropriate status based on result
    if (!result.success) {
      const statusCode = getErrorStatusCode(result.error?.code);
      return NextResponse.json(result, { status: statusCode });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Tools API error:', error);
    
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

/**
 * GET handler to list available tools
 */
export async function GET() {
  try {
    ensureToolsRegistered();
    
    const definitions = toolRegistry.getPromptDefinitions();
    
    return NextResponse.json({
      success: true,
      tools: definitions
    });
    
  } catch (error) {
    console.error('Tools API error:', error);
    
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

/**
 * Map error codes to HTTP status codes
 * @param {string} errorCode - Error code from tool execution
 * @returns {number} HTTP status code
 */
function getErrorStatusCode(errorCode) {
  const statusMap = {
    'TOOL_NOT_FOUND': 404,
    'VALIDATION_ERROR': 400,
    'INVALID_ACTION_ID': 400,
    'EXECUTION_ERROR': 500,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403
  };
  
  return statusMap[errorCode] || 500;
}
