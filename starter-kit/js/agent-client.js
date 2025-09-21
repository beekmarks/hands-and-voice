/**
 * Agent Client Implementation
 * 
 * This class orchestrates the complete agent processing flow using AG-UI Protocol events.
 * It serves as the bridge between user input, LLM processing, and WebMCP tool execution.
 * 
 * KEY RESPONSIBILITIES:
 * 1. Process user prompts through the LLM
 * 2. Execute WebMCP tools based on LLM decisions
 * 3. Stream AG-UI events for complete transparency
 * 4. Generate intelligent responses
 * 
 * The core flow: User Input → LLM → Tools → AG-UI Events → Response
 */

class AgentClient {
    constructor(tools) {
        this.tools = tools;
        this.llmClient = new LLMClient(tools);
        this.isProcessing = false;
    }

    /**
     * Process user prompt and stream AG-UI events for transparency
     * 
     * This is the main entry point for agent processing. It returns an async generator
     * that yields AG-UI protocol events as the agent processes the request.
     * 
     * @param {string} prompt - User input to process
     * @yields {Object} AG-UI protocol events
     */
    async *processPrompt(prompt) {
        if (this.isProcessing) {
            yield new window.AGUI.CustomEvent('Agent is already processing a request. Please wait.');
            return;
        }

        this.isProcessing = true;
        
        const threadId = 'thread_' + Date.now();
        const runId = 'run_' + Date.now();

        try {
            // Start the run using AG-UI protocol
            yield new window.AGUI.RunStartedEvent(threadId, runId);

            // Get tool calls from LLM (either real AI or keyword matching)
            const toolCalls = await this.llmClient.getToolCalls(prompt);

            // Process each tool call using proper AG-UI events
            const executedTools = [];
            for (const call of toolCalls) {
                const tool = this.tools.find(t => t.name === call.name);
                if (tool) {
                    const toolCallId = 'tool_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                    // AG-UI Tool Call Sequence: START -> ARGS -> END -> RESULT
                    yield new window.AGUI.ToolCallStartEvent(toolCallId, call.name, messageId);
                    
                    if (call.args && Object.keys(call.args).length > 0) {
                        yield new window.AGUI.ToolCallArgsEvent(toolCallId, JSON.stringify(call.args));
                    }
                    
                    try {
                        // Execute the WebMCP tool
                        const result = await tool.execute(call.args || {});
                        
                        yield new window.AGUI.ToolCallEndEvent(toolCallId);
                        yield new window.AGUI.ToolCallResultEvent(messageId, toolCallId, JSON.stringify(result));
                        
                        executedTools.push({ call, result });
                        
                    } catch (toolError) {
                        console.error(`Tool execution error for ${call.name}:`, toolError);
                        yield new window.AGUI.ToolCallEndEvent(toolCallId);
                        yield new window.AGUI.ToolCallResultEvent(messageId, toolCallId, JSON.stringify({
                            error: toolError.message,
                            success: false
                        }));
                    }
                } else {
                    console.warn(`Tool not found: ${call.name}`);
                }
            }

            // Generate and stream response
            yield* this.streamResponse(prompt, executedTools, runId);

            // Finish the run
            yield new window.AGUI.RunFinishedEvent(threadId, runId, 'completed');

        } catch (error) {
            console.error('Agent processing error:', error);
            
            // Send error using AG-UI protocol
            yield new window.AGUI.RunErrorEvent(threadId, runId, {
                message: error.message,
                code: 'PROCESSING_ERROR',
                timestamp: Date.now()
            });
            
            // Still finish the run even on error
            yield new window.AGUI.RunFinishedEvent(threadId, runId, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Stream the agent's response using AG-UI text message events
     * 
     * @param {string} originalPrompt - Original user prompt
     * @param {Array} executedTools - Tools that were executed
     * @param {string} runId - Current run ID for consistency
     * @yields {Object} AG-UI text message events
     */
    async *streamResponse(originalPrompt, executedTools, runId) {
        const responseMessageId = 'response_' + Date.now();
        
        // Start text message
        yield new window.AGUI.TextMessageStartEvent(responseMessageId, 'assistant');
        
        try {
            let response;
            
            if (executedTools.length > 0) {
                // Generate response based on executed tools
                if (this.llmClient.useRealLLM) {
                    // Use LLM to generate natural response
                    response = await this.llmClient.generateIntelligentResponse(originalPrompt, executedTools.map(t => t.call));
                    
                    // Stream the response word by word to simulate real-time generation
                    const words = response.split(' ');
                    for (let i = 0; i < words.length; i++) {
                        const chunk = (i === 0 ? '' : ' ') + words[i];
                        yield new window.AGUI.TextMessageContentEvent(responseMessageId, chunk);
                        // Small delay to simulate streaming
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                } else {
                    // Simple response for demo/keyword matching mode
                    response = this.generateSimpleResponse(executedTools);
                    yield new window.AGUI.TextMessageContentEvent(responseMessageId, response);
                }
            } else {
                // No tools were executed
                response = this.generateNoToolsResponse(originalPrompt);
                yield new window.AGUI.TextMessageContentEvent(responseMessageId, response);
            }
            
        } catch (responseError) {
            console.error('Error generating response:', responseError);
            const errorResponse = "I encountered an error while generating my response, but the requested actions may have completed successfully.";
            yield new window.AGUI.TextMessageContentEvent(responseMessageId, errorResponse);
        }
        
        // End text message
        yield new window.AGUI.TextMessageEndEvent(responseMessageId);
    }

    /**
     * Generate a response when tools were executed (demo mode)
     * 
     * @param {Array} executedTools - Tools that were executed with their results
     * @returns {string} Response message
     */
    generateSimpleResponse(executedTools) {
        if (executedTools.length === 1) {
            const tool = executedTools[0];
            return `I've executed the ${tool.call.name} tool for you. The results are displayed in your application above.`;
        } else {
            const toolNames = executedTools.map(t => t.call.name).join(', ');
            return `I've executed multiple tools for you: ${toolNames}. The results are displayed in your application above.`;
        }
    }

    /**
     * Generate a response when no tools were executed
     * 
     * @param {string} originalPrompt - Original user prompt
     * @returns {string} Response message
     */
    generateNoToolsResponse(originalPrompt) {
        // TODO: Customize this based on your application domain
        return `I understand your request: "${originalPrompt}", but I don't have the specific tools needed to help with that right now. Try asking me to show data, refresh information, analyze results, or generate reports.`;
    }

    /**
     * Check if agent is currently processing
     * 
     * @returns {boolean} True if processing is in progress
     */
    isAgentBusy() {
        return this.isProcessing;
    }

    /**
     * Get available tools for this agent
     * 
     * @returns {Array} Array of available WebMCP tools
     */
    getAvailableTools() {
        return [...this.tools];
    }

    /**
     * Get LLM client configuration
     * 
     * @returns {Object} LLM client configuration
     */
    getLLMConfig() {
        return this.llmClient.getConfig();
    }

    /**
     * Update tools available to the agent
     * 
     * @param {Array} newTools - New array of tools
     */
    updateTools(newTools) {
        this.tools = newTools;
        this.llmClient.tools = newTools;
        console.log(`Agent: Updated tools. Now have ${newTools.length} tools available.`);
    }

    /**
     * Process a simple command without full LLM processing
     * Useful for direct commands or testing
     * 
     * @param {string} toolName - Name of tool to execute
     * @param {Object} args - Tool arguments
     * @yields {Object} AG-UI protocol events
     */
    async *executeDirectTool(toolName, args = {}) {
        const threadId = 'direct_' + Date.now();
        const runId = 'run_' + Date.now();

        yield new window.AGUI.RunStartedEvent(threadId, runId);

        const tool = this.tools.find(t => t.name === toolName);
        if (!tool) {
            yield new window.AGUI.CustomEvent(`Tool "${toolName}" not found`);
            yield new window.AGUI.RunFinishedEvent(threadId, runId, 'error');
            return;
        }

        const toolCallId = 'direct_tool_' + Date.now();
        const messageId = 'direct_msg_' + Date.now();

        try {
            yield new window.AGUI.ToolCallStartEvent(toolCallId, toolName, messageId);
            
            if (args && Object.keys(args).length > 0) {
                yield new window.AGUI.ToolCallArgsEvent(toolCallId, JSON.stringify(args));
            }
            
            const result = await tool.execute(args);
            
            yield new window.AGUI.ToolCallEndEvent(toolCallId);
            yield new window.AGUI.ToolCallResultEvent(messageId, toolCallId, JSON.stringify(result));
            
            // Simple success message
            const responseMessageId = 'direct_response_' + Date.now();
            yield new window.AGUI.TextMessageStartEvent(responseMessageId);
            yield new window.AGUI.TextMessageContentEvent(responseMessageId, `Successfully executed ${toolName}`);
            yield new window.AGUI.TextMessageEndEvent(responseMessageId);
            
        } catch (error) {
            yield new window.AGUI.RunErrorEvent(threadId, runId, {
                message: error.message,
                code: 'DIRECT_TOOL_ERROR'
            });
        }

        yield new window.AGUI.RunFinishedEvent(threadId, runId, 'completed');
    }
}

/**
 * CUSTOMIZATION GUIDE:
 * 
 * 1. MODIFY RESPONSE GENERATION:
 * - Update generateSimpleResponse() for domain-specific messaging
 * - Customize generateNoToolsResponse() to guide users better
 * - Add response templates for common scenarios
 * 
 * 2. ADD CUSTOM EVENT TYPES:
 * - Use AGUI.CustomEvent for application-specific notifications
 * - Stream state updates using AGUI.StateDeltaEvent
 * - Add progress indicators for long-running operations
 * 
 * 3. ENHANCE ERROR HANDLING:
 * - Add retry logic for failed tool executions
 * - Implement circuit breaker patterns for unreliable tools
 * - Add detailed error categorization
 * 
 * 4. EXTEND PROCESSING CAPABILITIES:
 * - Add multi-step workflows (tool chains)
 * - Implement conditional tool execution
 * - Add user confirmation for destructive operations
 * 
 * EXAMPLE EXTENSIONS:
 * 
 * // Add confirmation for destructive actions
 * if (toolName.includes('delete') || toolName.includes('remove')) {
 *     yield new AGUI.CustomEvent('Requesting user confirmation for destructive action');
 *     // Wait for user confirmation...
 * }
 * 
 * // Add progress tracking for long operations
 * for (let i = 0; i < steps.length; i++) {
 *     yield new AGUI.CustomEvent(`Processing step ${i + 1} of ${steps.length}`);
 *     // Execute step...
 * }
 */