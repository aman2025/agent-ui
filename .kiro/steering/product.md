# Product Overview

AI Agent Dynamic UI is an AI-powered application that generates interactive user interfaces through structured JSON responses. Instead of a traditional chat interface, the LLM generates VM2 component structures that render as dynamic forms and displays.

## Core Concept

- User submits a natural language query
- LLM responds with JSON component structure (not conversational text)
- Frontend renders the JSON as interactive React components
- User interacts with forms, triggering tool executions
- Results render as new UI, replacing the previous view

## Key Features

- ReAct (Reasoning + Acting) agent pattern for multi-step workflows
- VM2 component system with security whitelist
- Dynamic UI generation from LLM JSON responses
- Sequential UI replacement (not chat-style conversation)
- Tool system for third-party API integrations

## User Flow

1. Single input field → user types request
2. LLM generates form UI → user fills fields
3. Form submission → tool execution → result UI
4. Each step replaces the previous view until workflow completion
