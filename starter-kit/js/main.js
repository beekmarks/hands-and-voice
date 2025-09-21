/**
 * Main Application Orchestrator
 * 
 * This file wires together all the components to create a working WebMCP + AG-UI application.
 * It handles:
 * - Component initialization and coordination
 * - User interface event handling
 * - LLM configuration management
 * - AG-UI event streaming and display
 * 
 * CUSTOMIZATION POINTS:
 * 1. Replace YourApp with your actual application class
 * 2. Customize example prompts for your domain
 * 3. Modify UI event handlers as needed
 * 4. Add application-specific initialization logic
 */

// Global application instance reference for easy access
let yourApp;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing WebMCP + AG-UI Starter Kit...');

    // ===== COMPONENT INITIALIZATION =====
    
    // 1. Initialize your main application (the "Hands")
    yourApp = new YourApp(document.getElementById('your-app'));
    
    // 2. Initialize UI components for the "Voice"
    const chatUI = new ChatUI(document.querySelector('.messages'));
    const agentUI = new AgentUI(document.querySelector('.agent-thought-process'), (message) => {
        // Callback: when a message is complete, add it to the chat UI
        chatUI.addAgentMessage(message);
    });
    
    // 3. Initialize the agent client with available tools
    const agentClient = new AgentClient(yourApp.getTools());

    // ===== UI ELEMENT REFERENCES =====
    
    const sendButton = document.getElementById('send-prompt');
    const userInput = document.getElementById('user-prompt');
    
    // LLM Configuration elements
    const openaiKeyInput = document.getElementById('openai-key');
    const configureLlmButton = document.getElementById('configure-llm');
    const clearLlmButton = document.getElementById('clear-llm');
    const statusIndicator = document.getElementById('llm-status');

    // ===== INITIALIZATION: Load saved configuration =====
    
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
        openaiKeyInput.value = savedApiKey;
        agentClient.llmClient.setApiKey(savedApiKey);
        updateLlmStatus(true);
    } else {
        updateLlmStatus(false);
    }

    // ===== LLM CONFIGURATION HANDLERS =====
    
    // Configure LLM with OpenAI API key
    configureLlmButton.addEventListener('click', () => {
        const apiKey = openaiKeyInput.value.trim();
        if (apiKey) {
            // Basic validation for OpenAI API key format
            if (!apiKey.startsWith('sk-')) {
                alert('Invalid OpenAI API key format. Keys should start with "sk-"');
                return;
            }
            
            // Save API key and enable real LLM mode
            localStorage.setItem('openai-api-key', apiKey);
            agentClient.llmClient.setApiKey(apiKey);
            updateLlmStatus(true);
            
            // Show success message in the AG-UI panel
            agentUI.clear();
            chatUI.clear();
            agentUI.renderEvent({
                type: 'CUSTOM',
                message: '✅ OpenAI API configured successfully! You can now use natural language commands.'
            });
        } else {
            alert('Please enter an OpenAI API key');
        }
    });

    // Clear LLM configuration and revert to demo mode
    clearLlmButton.addEventListener('click', () => {
        localStorage.removeItem('openai-api-key');
        agentClient.llmClient.clearApiKey();
        openaiKeyInput.value = '';
        updateLlmStatus(false);
        
        // Show demo mode message
        agentUI.clear();
        chatUI.clear();
        agentUI.renderEvent({
            type: 'CUSTOM',
            message: '🎯 Demo mode enabled! Try the example prompts or use keywords like "show", "refresh", "analyze".'
        });
    });

    // ===== USER INPUT HANDLERS =====
    
    // Handle send button click
    sendButton.addEventListener('click', () => handleUserInput());
    
    // Handle Enter key in input field
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });

    // ===== EXAMPLE PROMPT HANDLERS =====
    
    // Handle example prompt buttons
    document.querySelectorAll('.example-btn').forEach(button => {
        button.addEventListener('click', () => {
            const prompt = button.getAttribute('data-prompt');
            if (prompt) {
                userInput.value = prompt;
                handleUserInput();
            }
        });
    });

    // ===== CONCEPT EXPLAINER HANDLER =====
    
    // Toggle concept explainer
    const conceptHelp = document.getElementById('concept-help');
    const explainerContent = document.getElementById('explainer-content');
    
    if (conceptHelp && explainerContent) {
        conceptHelp.addEventListener('click', () => {
            explainerContent.classList.toggle('active');
        });
    }

    // ===== MAIN USER INPUT PROCESSING =====
    
    /**
     * Handle user input and process it through the agent
     */
    async function handleUserInput() {
        const prompt = userInput.value.trim();
        if (!prompt) return;

        // Check if agent is busy
        if (agentClient.isAgentBusy()) {
            alert('Agent is currently processing. Please wait for the current request to complete.');
            return;
        }

        // Clear input and show user message
        userInput.value = '';
        chatUI.addUserMessage(prompt);
        
        // Clear previous agent output
        agentUI.clear();

        try {
            // Process the prompt through the agent and stream AG-UI events
            const eventStream = agentClient.processPrompt(prompt);
            
            // Stream each AG-UI event as it's generated
            for await (const event of eventStream) {
                agentUI.renderEvent(event);
            }
            
        } catch (error) {
            console.error('Error processing user input:', error);
            
            // Show error in the AG-UI panel
            agentUI.renderEvent({
                type: 'CUSTOM',
                message: `❌ Error: ${error.message}`
            });
            
            // Also show error in chat
            chatUI.addAgentMessage(`I encountered an error: ${error.message}`);
        }
    }

    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Update the LLM status indicator
     * @param {boolean} isRealLLM - Whether real LLM mode is active
     */
    function updateLlmStatus(isRealLLM) {
        if (isRealLLM) {
            statusIndicator.textContent = 'OpenAI GPT Enabled';
            statusIndicator.style.backgroundColor = '#28a745';
            statusIndicator.style.color = 'white';
            configureLlmButton.style.display = 'none';
            clearLlmButton.style.display = 'inline-block';
        } else {
            statusIndicator.textContent = 'Demo Mode (Keyword Matching)';
            statusIndicator.style.backgroundColor = '#6c757d';
            statusIndicator.style.color = 'white';
            configureLlmButton.style.display = 'inline-block';
            clearLlmButton.style.display = 'none';
        }
    }

    // ===== APPLICATION-SPECIFIC INITIALIZATION =====
    
    // TODO: Add any custom initialization logic for your application here
    // Examples:
    // - Load initial data
    // - Set up periodic updates
    // - Initialize websocket connections
    // - Configure application-specific settings
    
    // Initialize application with welcome message
    agentUI.renderEvent({
        type: 'CUSTOM',
        message: '🚀 WebMCP + AG-UI Starter Kit initialized! Try asking me to show data, refresh information, or generate reports.'
    });

    console.log('✅ Starter Kit initialization complete');
});

// ===== UI COMPONENT CLASSES =====

/**
 * Chat UI Class - Clean conversation interface
 * Handles the human-readable conversation display
 */
class ChatUI {
    constructor(container) {
        this.container = container;
        this.messages = [];
    }

    /**
     * Add a user message to the chat
     * @param {string} message - User message text
     */
    addUserMessage(message) {
        this.messages.push({ type: 'user', content: message, timestamp: Date.now() });
        this.render();
    }

    /**
     * Add an agent message to the chat
     * @param {string} message - Agent message text
     */
    addAgentMessage(message) {
        this.messages.push({ type: 'agent', content: message, timestamp: Date.now() });
        this.render();
    }

    /**
     * Render all messages
     */
    render() {
        this.container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.type}-message">
                <div class="message-avatar">${msg.type === 'user' ? '👤' : '🤖'}</div>
                <div class="message-content">${msg.content}</div>
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    /**
     * Clear all messages
     */
    clear() {
        this.messages = [];
        this.render();
    }
}

/**
 * Agent UI Class - Technical AG-UI events display
 * Handles the real-time transparency into agent thinking
 */
class AgentUI {
    constructor(container, onMessageComplete) {
        this.container = container;
        this.onMessageComplete = onMessageComplete;
        this.events = [];
        this.currentMessage = null;
        this.messageBuffer = '';
    }

    /**
     * Render a new AG-UI protocol event
     * @param {Object} event - AG-UI protocol event
     */
    renderEvent(event) {
        const timestamp = new Date(event.timestamp || Date.now()).toLocaleTimeString();
        let eventDisplay = '';
        let voiceIcon = '🎙️';
        
        // Format different event types
        switch (event.type) {
            case 'RUN_STARTED':
                eventDisplay = `🎯 <strong>Run Started</strong> (${event.runId})`;
                voiceIcon = '🚀';
                break;
            case 'RUN_FINISHED':
                eventDisplay = `✅ <strong>Run Finished</strong> (${event.result})`;
                voiceIcon = '🏁';
                break;
            case 'RUN_ERROR':
                eventDisplay = `❌ <strong>Error:</strong> ${event.error?.message || 'Unknown error'}`;
                voiceIcon = '⚠️';
                break;
            case 'TOOL_CALL_START':
                eventDisplay = `🔧 <strong>Tool Call:</strong> ${event.toolCallName}`;
                voiceIcon = '🛠️';
                break;
            case 'TOOL_CALL_ARGS':
                eventDisplay = `⚙️ <strong>Arguments:</strong> ${event.delta}`;
                voiceIcon = '📋';
                break;
            case 'TOOL_CALL_END':
                eventDisplay = `🔧 <strong>Tool Completed</strong>`;
                voiceIcon = '✅';
                break;
            case 'TOOL_CALL_RESULT':
                eventDisplay = `📊 <strong>Result:</strong> ${event.result.substring(0, 100)}${event.result.length > 100 ? '...' : ''}`;
                voiceIcon = '📈';
                break;
            case 'TEXT_MESSAGE_START':
                eventDisplay = `💬 <strong>Generating Response...</strong>`;
                voiceIcon = '💭';
                this.currentMessage = { id: event.messageId, content: '' };
                this.messageBuffer = '';
                break;
            case 'TEXT_MESSAGE_CONTENT':
                if (this.currentMessage && this.currentMessage.id === event.messageId) {
                    this.messageBuffer += event.delta;
                    eventDisplay = `💬 <strong>Response:</strong> ${this.messageBuffer}`;
                    voiceIcon = '💬';
                }
                break;
            case 'TEXT_MESSAGE_END':
                if (this.currentMessage && this.currentMessage.id === event.messageId) {
                    eventDisplay = `💬 <strong>Response Complete</strong>`;
                    voiceIcon = '✨';
                    // Notify completion with the full message
                    if (this.onMessageComplete) {
                        this.onMessageComplete(this.messageBuffer);
                    }
                    this.currentMessage = null;
                }
                break;
            case 'CUSTOM':
                eventDisplay = `💡 ${event.message}`;
                voiceIcon = '💡';
                break;
            default:
                eventDisplay = `${event.type}: ${JSON.stringify(event)}`;
                break;
        }

        // Add event to display
        const eventElement = document.createElement('div');
        eventElement.className = 'agent-event';
        eventElement.innerHTML = `
            <div class="event-header">
                <span class="voice-indicator">${voiceIcon}</span>
                <span class="event-time">${timestamp}</span>
            </div>
            <div class="event-content">${eventDisplay}</div>
        `;

        this.container.appendChild(eventElement);
        this.container.scrollTop = this.container.scrollHeight;

        // Store event for potential replay/debugging
        this.events.push({ ...event, displayedAt: Date.now() });
    }

    /**
     * Clear all events
     */
    clear() {
        this.container.innerHTML = '';
        this.events = [];
        this.currentMessage = null;
        this.messageBuffer = '';
    }

    /**
     * Get all recorded events
     * @returns {Array} Array of all AG-UI events
     */
    getEventHistory() {
        return [...this.events];
    }
}

// ===== GLOBAL FUNCTIONS FOR CONSOLE ACCESS =====

/**
 * Global functions for testing and debugging
 * These can be called from the browser console
 */

window.testAgent = {
    /**
     * Test a direct tool execution
     * @param {string} toolName - Name of tool to test
     * @param {Object} args - Tool arguments
     */
    async executeTool(toolName, args = {}) {
        const agentClient = new AgentClient(yourApp.getTools());
        console.log(`Testing tool: ${toolName}`, args);
        
        for await (const event of agentClient.executeDirectTool(toolName, args)) {
            console.log('Event:', event);
        }
    },

    /**
     * List all available tools
     */
    listTools() {
        const tools = yourApp.getTools();
        console.log('Available tools:', tools.map(t => `${t.name}: ${t.description}`));
        return tools;
    },

    /**
     * Test the LLM with a prompt
     * @param {string} prompt - Test prompt
     */
    async testLLM(prompt) {
        const agentClient = new AgentClient(yourApp.getTools());
        const toolCalls = await agentClient.llmClient.getToolCalls(prompt);
        console.log('LLM response for prompt:', prompt);
        console.log('Tool calls:', toolCalls);
        return toolCalls;
    }
};

/**
 * CUSTOMIZATION EXAMPLES:
 * 
 * 1. ADD CUSTOM KEYBOARD SHORTCUTS:
 * document.addEventListener('keydown', (e) => {
 *     if (e.ctrlKey && e.key === 'k') {
 *         e.preventDefault();
 *         userInput.focus();
 *     }
 * });
 * 
 * 2. ADD AUTO-SAVE FUNCTIONALITY:
 * setInterval(() => {
 *     localStorage.setItem('app-state', JSON.stringify(yourApp.getState()));
 * }, 30000);
 * 
 * 3. ADD WEBSOCKET INTEGRATION:
 * const ws = new WebSocket('ws://your-server');
 * ws.onmessage = (event) => {
 *     const data = JSON.parse(event.data);
 *     yourApp.updateState(data);
 * };
 * 
 * 4. ADD CUSTOM AGENT BEHAVIORS:
 * agentClient.addPreProcessor((prompt) => {
 *     // Modify or validate prompts before processing
 *     return prompt.toLowerCase().trim();
 * });
 */