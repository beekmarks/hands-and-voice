class LLMClient {
    constructor(tools) {
        this.tools = tools;
        this.apiKey = null;
        this.useRealLLM = false;
    }

    // Configure OpenAI API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.useRealLLM = true;
    }

    async getToolCalls(prompt) {
        if (this.useRealLLM && this.apiKey) {
            return await this.getToolCallsFromOpenAI(prompt);
        } else {
            // Fallback to enhanced keyword matching for POC demonstration
            return await this.getToolCallsFromKeywords(prompt);
        }
    }

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

            const messages = [
                {
                    role: "system",
                    content: `You are a helpful financial advisor assistant. You have access to portfolio management tools. 
                    When users ask about their portfolio, use the available tools to help them.
                    Available tools: ${this.tools.map(t => `${t.name} - ${t.description}`).join(', ')}`
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
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
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
            return await this.getToolCallsFromKeywords(prompt);
        }
    }

    generateParametersForTool(toolName) {
        const parameterSchemas = {
            'getPortfolio': {
                type: "object",
                properties: {},
                required: []
            },
            'rebalancePortfolio': {
                type: "object",
                properties: {
                    strategy: {
                        type: "string",
                        enum: ["conservative", "moderate", "aggressive"],
                        description: "The investment strategy to apply"
                    }
                },
                required: ["strategy"]
            },
            'getRetirementProjection': {
                type: "object",
                properties: {
                    yearsToRetirement: {
                        type: "number",
                        description: "Number of years until retirement"
                    },
                    monthlyContribution: {
                        type: "number", 
                        description: "Monthly contribution amount in dollars"
                    }
                },
                required: []
            }
        };

        return parameterSchemas[toolName] || {
            type: "object",
            properties: {},
            required: []
        };
    }

    async getToolCallsFromKeywords(prompt) {
        // Enhanced keyword matching for POC demonstration
        const calls = [];
        const lowerPrompt = prompt.toLowerCase();
        
        // Portfolio viewing patterns
        if (lowerPrompt.includes("show") && (lowerPrompt.includes("portfolio") || lowerPrompt.includes("allocation"))) {
            calls.push({ name: 'getPortfolio' });
        }
        
        // Portfolio rebalancing patterns
        if (lowerPrompt.includes("diversify") || lowerPrompt.includes("rebalance")) {
            calls.push({ name: 'getPortfolio' });
            
            let strategy = 'moderate'; // default
            if (lowerPrompt.includes("aggressive") || lowerPrompt.includes("risky") || lowerPrompt.includes("growth")) {
                strategy = 'aggressive';
            } else if (lowerPrompt.includes("conservative") || lowerPrompt.includes("safe") || lowerPrompt.includes("stable")) {
                strategy = 'conservative';
            }
            
            calls.push({ name: 'rebalancePortfolio', args: { strategy } });
        }
        
        // Strategy-specific rebalancing
        if (lowerPrompt.includes("make it more aggressive") || lowerPrompt.includes("increase risk")) {
            calls.push({ name: 'rebalancePortfolio', args: { strategy: 'aggressive' } });
        }
        
        if (lowerPrompt.includes("make it conservative") || lowerPrompt.includes("reduce risk")) {
            calls.push({ name: 'rebalancePortfolio', args: { strategy: 'conservative' } });
        }
        
        // Retirement planning patterns
        if (lowerPrompt.includes("retirement") && (lowerPrompt.includes("projection") || lowerPrompt.includes("plan") || lowerPrompt.includes("future"))) {
            // Extract years if mentioned
            const yearsMatch = lowerPrompt.match(/(\d+)\s*years?/);
            const monthlyMatch = lowerPrompt.match(/\$?(\d+)\s*(?:per month|monthly)/);
            
            const args = {};
            if (yearsMatch) {
                args.yearsToRetirement = parseInt(yearsMatch[1]);
            }
            if (monthlyMatch) {
                args.monthlyContribution = parseInt(monthlyMatch[1]);
            }
            
            calls.push({ name: 'getRetirementProjection', args });
        }
        
        // Simple portfolio analysis
        if ((lowerPrompt.includes("analyze") || lowerPrompt.includes("review")) && lowerPrompt.includes("portfolio")) {
            calls.push({ name: 'getPortfolio' });
        }
        
        // Handle direct strategy commands
        const strategyPatterns = {
            'aggressive': /(?:aggressive|growth|risky|high.?risk)/i,
            'moderate': /(?:moderate|balanced|medium.?risk)/i,
            'conservative': /(?:conservative|safe|low.?risk|stable)/i
        };
        
        for (const [strategy, pattern] of Object.entries(strategyPatterns)) {
            if (pattern.test(prompt) && (lowerPrompt.includes("set") || lowerPrompt.includes("change") || lowerPrompt.includes("switch"))) {
                calls.push({ name: 'rebalancePortfolio', args: { strategy } });
                break;
            }
        }

        return calls;
    }
}