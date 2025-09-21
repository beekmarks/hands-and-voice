/**
 * LLM Client Implementation
 * 
 * This class provides dual-mode LLM integration:
 * 1. Demo Mode: Keyword-based pattern matching (no API key required)
 * 2. Real LLM Mode: Integration with OpenAI GPT models
 * 
 * CUSTOMIZATION:
 * - Add your own keyword patterns in getToolCallsFromKeywords()
 * - Modify the system prompt in getToolCallsFromOpenAI()
 * - Add support for other LLM providers (Claude, Gemini, etc.)
 * - Customize tool parameter schemas for better LLM understanding
 */

class LLMClient {
    constructor(tools) {
        this.tools = tools;
        this.apiKey = null;
        this.useRealLLM = false;
        this.llmProvider = 'openai'; // Future: support multiple providers
    }

    /**
     * Configure API key for real LLM integration
     * @param {string} apiKey - OpenAI API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.useRealLLM = true;
        console.log('LLM Client: Real LLM mode enabled');
    }

    /**
     * Clear API key and revert to demo mode
     */
    clearApiKey() {
        this.apiKey = null;
        this.useRealLLM = false;
        console.log('LLM Client: Demo mode enabled');
    }

    /**
     * Get tool calls from user input (main entry point)
     * @param {string} prompt - User input
     * @returns {Promise<Array>} Array of tool call objects
     */
    async getToolCalls(prompt) {
        if (this.useRealLLM && this.apiKey) {
            return await this.getToolCallsFromOpenAI(prompt);
        } else {
            return await this.getToolCallsFromKeywords(prompt);
        }
    }

    /**
     * Real LLM integration using OpenAI GPT models
     * @param {string} prompt - User input
     * @returns {Promise<Array>} Array of tool call objects
     */
    async getToolCallsFromOpenAI(prompt) {
        try {
            const toolDefinitions = this.tools.map(tool => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: this.generateParametersForTool(tool.name)
                }
            }));

            // TODO: Customize the system prompt for your application domain
            const systemPrompt = `You are a helpful AI assistant that can interact with the user's application through available tools.
            
Available tools: ${this.tools.map(t => `${t.name} - ${t.description}`).join(', ')}

When users ask for help, use the appropriate tools to assist them. Always prioritize the most relevant tool for their request.`;

            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user", 
                    content: prompt
                }
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    tools: toolDefinitions,
                    tool_choice: "auto",
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            
            // Extract tool calls from OpenAI response
            const calls = [];
            if (data.choices?.[0]?.message?.tool_calls) {
                for (const toolCall of data.choices[0].message.tool_calls) {
                    if (toolCall.type === 'function') {
                        calls.push({
                            name: toolCall.function.name,
                            args: JSON.parse(toolCall.function.arguments || '{}')
                        });
                    }
                }
            }

            return calls;
            
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            // Fallback to keyword matching if API fails
            console.log('Falling back to demo mode due to API error');
            return await this.getToolCallsFromKeywords(prompt);
        }
    }

    /**
     * Demo mode: Keyword-based pattern matching
     * 
     * TODO: Replace these patterns with keywords relevant to your application
     * 
     * @param {string} prompt - User input
     * @returns {Promise<Array>} Array of tool call objects
     */
    async getToolCallsFromKeywords(prompt) {
        const lowercasePrompt = prompt.toLowerCase();
        const calls = [];

        // TODO: Customize these keyword patterns for your application domain
        
        // Example patterns for generic data operations
        if (lowercasePrompt.includes('show') || lowercasePrompt.includes('get') || 
            lowercasePrompt.includes('display') || lowercasePrompt.includes('view')) {
            calls.push({ name: 'getAppData', args: {} });
        }
        
        if (lowercasePrompt.includes('refresh') || lowercasePrompt.includes('reload') || 
            lowercasePrompt.includes('update') || lowercasePrompt.includes('fetch')) {
            calls.push({ name: 'refreshData', args: {} });
        }
        
        if (lowercasePrompt.includes('analyze') || lowercasePrompt.includes('analysis') || 
            lowercasePrompt.includes('examine') || lowercasePrompt.includes('insight')) {
            calls.push({ name: 'analyzeData', args: {} });
        }
        
        if (lowercasePrompt.includes('report') || lowercasePrompt.includes('generate') || 
            lowercasePrompt.includes('create') || lowercasePrompt.includes('export')) {
            calls.push({ name: 'generateReport', args: {} });
        }

        // EXAMPLE PATTERNS FOR DIFFERENT APPLICATION TYPES:
        
        // E-COMMERCE PATTERNS:
        // if (lowercasePrompt.includes('search') || lowercasePrompt.includes('find')) {
        //     calls.push({ name: 'searchProducts', args: { query: prompt } });
        // }
        // if (lowercasePrompt.includes('cart') || lowercasePrompt.includes('add')) {
        //     calls.push({ name: 'addToCart', args: {} });
        // }
        
        // DOCUMENT MANAGEMENT PATTERNS:
        // if (lowercasePrompt.includes('document') || lowercasePrompt.includes('file')) {
        //     calls.push({ name: 'searchDocuments', args: { query: prompt } });
        // }
        // if (lowercasePrompt.includes('folder') || lowercasePrompt.includes('directory')) {
        //     calls.push({ name: 'createFolder', args: {} });
        // }
        
        // TASK MANAGEMENT PATTERNS:
        // if (lowercasePrompt.includes('task') || lowercasePrompt.includes('todo')) {
        //     calls.push({ name: 'createTask', args: { description: prompt } });
        // }
        // if (lowercasePrompt.includes('assign') || lowercasePrompt.includes('delegate')) {
        //     calls.push({ name: 'assignTask', args: {} });
        // }

        // Simulate async behavior for consistency
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return calls;
    }

    /**
     * Generate parameter schemas for OpenAI function calling
     * 
     * TODO: Customize parameter definitions for your specific tools
     * 
     * @param {string} toolName - Name of the tool
     * @returns {Object} Parameter schema for the tool
     */
    generateParametersForTool(toolName) {
        // Generic parameter schemas - customize for your tools
        const parameterSchemas = {
            'getAppData': {
                type: "object",
                properties: {},
                required: []
            },
            'refreshData': {
                type: "object",
                properties: {
                    force: {
                        type: "boolean",
                        description: "Whether to force refresh even if data is recent"
                    }
                },
                required: []
            },
            'analyzeData': {
                type: "object",
                properties: {
                    analysisType: {
                        type: "string",
                        enum: ["basic", "detailed", "statistical"],
                        description: "Type of analysis to perform"
                    },
                    filters: {
                        type: "object",
                        description: "Filters to apply during analysis"
                    }
                },
                required: []
            },
            'generateReport': {
                type: "object",
                properties: {
                    format: {
                        type: "string",
                        enum: ["pdf", "excel", "json"],
                        description: "Report output format"
                    },
                    title: {
                        type: "string",
                        description: "Title for the report"
                    },
                    includeSummary: {
                        type: "boolean",
                        description: "Whether to include an executive summary"
                    }
                },
                required: []
            }
            
            // TODO: Add schemas for your custom tools
            // 'searchProducts': {
            //     type: "object",
            //     properties: {
            //         query: { type: "string", description: "Search query" },
            //         category: { type: "string", description: "Product category" },
            //         minPrice: { type: "number", description: "Minimum price" },
            //         maxPrice: { type: "number", description: "Maximum price" }
            //     },
            //     required: ["query"]
            // },
            // 'createTask': {
            //     type: "object", 
            //     properties: {
            //         title: { type: "string", description: "Task title" },
            //         description: { type: "string", description: "Task description" },
            //         priority: { type: "string", enum: ["low", "medium", "high"] },
            //         dueDate: { type: "string", format: "date" }
            //     },
            //     required: ["title"]
            // }
        };

        return parameterSchemas[toolName] || {
            type: "object",
            properties: {},
            required: []
        };
    }

    /**
     * Generate an intelligent response using the LLM (for real LLM mode)
     * @param {string} originalPrompt - Original user prompt
     * @param {Array} toolCalls - Tool calls that were executed
     * @returns {Promise<string>} Generated response
     */
    async generateIntelligentResponse(originalPrompt, toolCalls) {
        if (!this.useRealLLM || !this.apiKey) {
            return this.generateSimpleResponse(toolCalls);
        }

        try {
            // TODO: Customize this prompt for your application domain
            const responsePrompt = `The user asked: "${originalPrompt}"
            
I executed these tools: ${toolCalls.map(call => `${call.name}(${JSON.stringify(call.args)})`).join(', ')}

Please provide a helpful response explaining what was accomplished and any relevant insights from the results.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant. Provide clear, concise responses about what actions were taken."
                        },
                        {
                            role: "user",
                            content: responsePrompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            } else {
                throw new Error('Failed to generate response');
            }
        } catch (error) {
            console.error('Error generating intelligent response:', error);
            return this.generateSimpleResponse(toolCalls);
        }
    }

    /**
     * Generate a simple response for demo mode
     * @param {Array} toolCalls - Tool calls that were executed
     * @returns {string} Simple response
     */
    generateSimpleResponse(toolCalls) {
        if (toolCalls.length === 0) {
            return "I understand your request, but I don't have the right tools to help with that at the moment.";
        }

        const toolNames = toolCalls.map(call => call.name).join(', ');
        return `I've executed the following tools for you: ${toolNames}. The results are displayed in your application above.`;
    }

    /**
     * Set LLM provider (for future multi-provider support)
     * @param {string} provider - Provider name ('openai', 'claude', 'gemini', etc.)
     */
    setProvider(provider) {
        this.llmProvider = provider;
        console.log(`LLM Client: Provider set to ${provider}`);
        // TODO: Implement support for other providers
    }

    /**
     * Get current configuration
     * @returns {Object} Current LLM client configuration
     */
    getConfig() {
        return {
            useRealLLM: this.useRealLLM,
            provider: this.llmProvider,
            hasApiKey: !!this.apiKey,
            toolCount: this.tools.length
        };
    }
}

/**
 * CUSTOMIZATION EXAMPLES:
 * 
 * 1. ADD CUSTOM KEYWORD PATTERNS:
 * In getToolCallsFromKeywords(), add patterns like:
 * if (lowercasePrompt.includes('your-keyword')) {
 *     calls.push({ name: 'yourTool', args: { param: value } });
 * }
 * 
 * 2. ADD TOOL PARAMETER SCHEMAS:
 * In generateParametersForTool(), add schemas like:
 * 'yourTool': {
 *     type: "object",
 *     properties: {
 *         param1: { type: "string", description: "Description" },
 *         param2: { type: "number", description: "Description" }
 *     },
 *     required: ["param1"]
 * }
 * 
 * 3. CUSTOMIZE SYSTEM PROMPT:
 * In getToolCallsFromOpenAI(), modify the system prompt to describe your application domain
 * 
 * 4. ADD MULTI-PROVIDER SUPPORT:
 * Implement additional provider methods like getToolCallsFromClaude(), getToolCallsFromGemini()
 */