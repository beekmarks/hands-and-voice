class AgentClient {
    constructor(tools) {
        this.tools = tools;
        this.llmClient = new LLMClient(tools);
    }

    async *processPrompt(prompt) {
        const threadId = 'thread_' + Date.now();
        const runId = 'run_' + Date.now();

        // Start the run using AG-UI protocol
        yield new window.AGUI.RunStartedEvent(threadId, runId);

        try {
            // Get tool calls from LLM
            const toolCalls = await this.llmClient.getToolCalls(prompt);

            // Process each tool call using proper AG-UI events
            for (const call of toolCalls) {
                const tool = this.tools.find(t => t.name === call.name);
                if (tool) {
                    const toolCallId = 'tool_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                    // Tool call sequence: START -> ARGS -> END -> RESULT
                    yield new window.AGUI.ToolCallStartEvent(toolCallId, call.name, messageId);
                    
                    if (call.args) {
                        yield new window.AGUI.ToolCallArgsEvent(toolCallId, JSON.stringify(call.args));
                    }
                    
                    const result = await tool.execute(call.args);
                    
                    yield new window.AGUI.ToolCallEndEvent(toolCallId);
                    yield new window.AGUI.ToolCallResultEvent(messageId, toolCallId, JSON.stringify(result));
                }
            }

            // Generate intelligent response based on results and LLM mode
            if (toolCalls.length > 0) {
                const responseMessageId = 'response_' + Date.now();
                yield new window.AGUI.TextMessageStartEvent(responseMessageId, 'assistant');
                
                if (this.llmClient.useRealLLM) {
                    // Use LLM to generate natural response
                    const response = await this.generateIntelligentResponse(prompt, toolCalls);
                    // Simulate streaming response
                    const words = response.split(' ');
                    for (let i = 0; i < words.length; i++) {
                        const chunk = (i === 0 ? '' : ' ') + words[i];
                        yield new window.AGUI.TextMessageContentEvent(responseMessageId, chunk);
                        // Small delay to simulate streaming
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                } else {
                    // Simple response for keyword matching mode
                    const toolNames = toolCalls.map(call => call.name).join(', ');
                    yield new window.AGUI.TextMessageContentEvent(responseMessageId, `I've executed the following tools for you: ${toolNames}. The results are displayed in your portfolio above.`);
                }
                
                yield new window.AGUI.TextMessageEndEvent(responseMessageId);
            }

            // If no tool calls, send a simple response
            if (toolCalls.length === 0) {
                const messageId = 'msg_' + Date.now();
                yield new window.AGUI.TextMessageStartEvent(messageId, 'assistant');
                yield new window.AGUI.TextMessageContentEvent(messageId, "I understand your request, but I don't have the specific tools needed to help with that right now.");
                yield new window.AGUI.TextMessageEndEvent(messageId);
            }

        } catch (error) {
            // Send error using AG-UI protocol
            yield {
                type: window.AGUI.EventType.RUN_ERROR,
                message: error.message,
                code: 'EXECUTION_ERROR'
            };
        }

        // Finish the run
        yield new window.AGUI.RunFinishedEvent(threadId, runId, 'completed');
    }

    async generateIntelligentResponse(originalPrompt, toolCalls) {
        try {
            // Gather tool results for context
            const toolResults = [];
            for (const call of toolCalls) {
                const tool = this.tools.find(t => t.name === call.name);
                if (tool) {
                    const result = await tool.execute(call.args);
                    toolResults.push({
                        tool: call.name,
                        args: call.args,
                        result: result
                    });
                }
            }

            const contextMessages = [
                {
                    role: "system",
                    content: "You are a helpful financial advisor assistant. Provide clear, concise responses about portfolio actions. Be professional and informative."
                },
                {
                    role: "user",
                    content: `I asked: "${originalPrompt}"`
                },
                {
                    role: "assistant",
                    content: `I executed these tools: ${JSON.stringify(toolResults)}. Please provide a natural, helpful response to the user about what was done.`
                }
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.llmClient.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: contextMessages,
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "I've completed your request successfully.";
            
        } catch (error) {
            console.error('Error generating intelligent response:', error);
            return "I've completed your request successfully.";
        }
    }
}