document.addEventListener('DOMContentLoaded', () => {
    const fidelityApp = new FidelityApp(document.getElementById('fidelity-app'));
    const chatUI = new ChatUI(document.querySelector('.messages'));
    const agentUI = new AgentUI(document.querySelector('.agent-thought-process'), (message) => {
        // Callback: when a message is complete, add it to the chat UI
        chatUI.addAgentMessage(message);
    });
    const agentClient = new AgentClient(fidelityApp.getTools());

    const sendButton = document.getElementById('send-prompt');
    const userInput = document.getElementById('user-prompt');
    
    // LLM Configuration elements
    const openaiKeyInput = document.getElementById('openai-key');
    const configureLlmButton = document.getElementById('configure-llm');
    const clearLlmButton = document.getElementById('clear-llm');
    const statusIndicator = document.getElementById('llm-status');

    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
        openaiKeyInput.value = savedApiKey;
        agentClient.llmClient.setApiKey(savedApiKey);
        updateLlmStatus(true);
    } else {
        updateLlmStatus(false);
    }

    // Configure LLM with OpenAI
    configureLlmButton.addEventListener('click', () => {
        const apiKey = openaiKeyInput.value.trim();
        if (apiKey) {
            // Basic validation
            if (!apiKey.startsWith('sk-')) {
                alert('Invalid OpenAI API key format. Keys should start with "sk-"');
                return;
            }
            
            localStorage.setItem('openai-api-key', apiKey);
            agentClient.llmClient.setApiKey(apiKey);
            updateLlmStatus(true);
            
            // Show success message
            agentUI.clear();
            chatUI.clear();
            agentUI.renderEvent({
                type: 'CUSTOM',
                message: '✅ OpenAI API configured successfully! You can now use natural language commands.'
            });
        } else {
            alert('Please enter your OpenAI API key');
        }
    });

    // Clear LLM configuration
    clearLlmButton.addEventListener('click', () => {
        localStorage.removeItem('openai-api-key');
        openaiKeyInput.value = '';
        agentClient.llmClient.setApiKey(null);
        agentClient.llmClient.useRealLLM = false;
        updateLlmStatus(false);
        
        agentUI.clear();
        chatUI.clear();
        agentUI.renderEvent({
            type: 'CUSTOM',
            message: '🔄 Switched to keyword matching mode'
        });
    });

    function updateLlmStatus(isUsingLLM) {
        if (isUsingLLM) {
            statusIndicator.textContent = 'OpenAI GPT-3.5 Enabled';
            statusIndicator.className = 'status-indicator llm-mode';
            configureLlmButton.style.display = 'none';
            clearLlmButton.style.display = 'inline-block';
            openaiKeyInput.disabled = true;
        } else {
            statusIndicator.textContent = 'Using Keyword Matching';
            statusIndicator.className = 'status-indicator keyword-mode';
            configureLlmButton.style.display = 'inline-block';
            clearLlmButton.style.display = 'none';
            openaiKeyInput.disabled = false;
        }
    }

    async function processPrompt(prompt) {
        if (prompt.trim()) {
            // Add user message to chat UI
            chatUI.addUserMessage(prompt);
            
            // Clear technical events for new conversation
            agentUI.clear();
            
            // Process agent events (AgentUI will automatically add responses to ChatUI via callback)
            const events = agentClient.processPrompt(prompt);
            for await (const event of events) {
                // Show technical events in AgentUI (which will trigger ChatUI updates automatically)
                agentUI.renderEvent(event);
            }
            
            userInput.value = '';
        }
    }

    // Handle send button click
    sendButton.addEventListener('click', async () => {
        await processPrompt(userInput.value);
    });

    // Handle enter key in input
    userInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await processPrompt(userInput.value);
        }
    });

    // Handle example prompt buttons
    document.querySelectorAll('.example-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const prompt = button.getAttribute('data-prompt');
            userInput.value = prompt;
            await processPrompt(prompt);
        });
    });

    // Handle concept explainer toggle
    const conceptHelp = document.getElementById('concept-help');
    const explainerContent = document.getElementById('explainer-content');
    
    if (conceptHelp && explainerContent) {
        conceptHelp.addEventListener('click', () => {
            explainerContent.classList.toggle('expanded');
            conceptHelp.textContent = explainerContent.classList.contains('expanded') 
                ? '💡 Hide Hands vs Voice Explanation' 
                : '💡 Understanding Hands vs Voice';
        });
    }
});

class ChatUI {
    constructor(container) {
        this.container = container;
        this.messageHistory = [];
    }

    addUserMessage(message) {
        this.messageHistory.push({
            type: 'user',
            content: message,
            timestamp: new Date()
        });
        this.renderMessage('user', message);
    }

    addAgentMessage(message) {
        this.messageHistory.push({
            type: 'agent', 
            content: message,
            timestamp: new Date()
        });
        this.renderMessage('agent', message);
    }

    renderMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timestamp);
        
        this.container.appendChild(messageDiv);
        this.container.scrollTop = this.container.scrollHeight;
    }

    clear() {
        this.container.innerHTML = '';
        this.messageHistory = [];
    }

    getHistory() {
        return [...this.messageHistory];
    }
}

class AgentUI {
    constructor(container, onMessageComplete = null) {
        this.container = container;
        this.activeMessages = new Map();
        this.activeToolCalls = new Map();
        this.onMessageComplete = onMessageComplete;
    }

    renderEvent(event) {
        const p = document.createElement('p');
        let message = '';
        let className = 'event';

        switch (event.type) {
            case window.AGUI.EventType.RUN_STARTED:
                message = `🚀 Run Started (ID: ${event.runId})`;
                className = 'event run-lifecycle';
                break;
            
            case window.AGUI.EventType.RUN_FINISHED:
                message = `✅ Run Finished (Result: ${event.result || 'success'})`;
                className = 'event run-lifecycle';
                break;
            
            case window.AGUI.EventType.TEXT_MESSAGE_START:
                message = `💬 Starting message (ID: ${event.messageId})`;
                className = 'event text-message';
                this.activeMessages.set(event.messageId, '');
                break;
            
            case window.AGUI.EventType.TEXT_MESSAGE_CONTENT:
                const currentContent = this.activeMessages.get(event.messageId) || '';
                const newContent = currentContent + event.delta;
                this.activeMessages.set(event.messageId, newContent);
                // Don't render individual content chunks, just accumulate them
                return;
            
            case window.AGUI.EventType.TEXT_MESSAGE_END:
                const finalContent = this.activeMessages.get(event.messageId);
                message = `✉️ Message complete: "${finalContent}"`;
                className = 'event text-message';
                
                // Notify callback about complete message
                if (this.onMessageComplete && finalContent) {
                    this.onMessageComplete(finalContent);
                }
                
                this.activeMessages.delete(event.messageId);
                break;
            
            case window.AGUI.EventType.TOOL_CALL_START:
                message = `🔧 Starting tool call: ${event.toolCallName} (ID: ${event.toolCallId})`;
                className = 'event tool-call';
                this.activeToolCalls.set(event.toolCallId, { name: event.toolCallName, args: '' });
                break;
            
            case window.AGUI.EventType.TOOL_CALL_ARGS:
                const toolCall = this.activeToolCalls.get(event.toolCallId);
                if (toolCall) {
                    toolCall.args += event.delta;
                    message = `⚙️ Tool arguments: ${event.delta}`;
                    className = 'event tool-args';
                }
                break;
            
            case window.AGUI.EventType.TOOL_CALL_END:
                const completedCall = this.activeToolCalls.get(event.toolCallId);
                if (completedCall) {
                    message = `🔨 Tool call completed: ${completedCall.name}`;
                    className = 'event tool-call';
                }
                break;
            
            case window.AGUI.EventType.TOOL_CALL_RESULT:
                message = `📊 Tool result: ${event.content}`;
                className = 'event tool-result';
                this.activeToolCalls.delete(event.toolCallId);
                break;
            
            case window.AGUI.EventType.RUN_ERROR:
                message = `❌ Error: ${event.message}`;
                className = 'event error';
                break;
            
            case 'CUSTOM':
                message = event.message || JSON.stringify(event);
                className = 'event custom';
                break;
            
            default:
                message = `[${event.type}] ${JSON.stringify(event)}`;
                className = 'event unknown';
        }

        // Add voice indicator prefix to emphasize this is the "Voice"
        const voicePrefix = this.getVoicePrefix(event.type);
        p.innerHTML = `<span class="voice-indicator">${voicePrefix}</span>${message}`;
        p.className = className;
        
        // Add speaking animation for text messages
        if (event.type === window.AGUI.EventType.TEXT_MESSAGE_END) {
            p.classList.add('voice-speaking');
        }
        
        this.container.appendChild(p);
        this.container.scrollTop = this.container.scrollHeight;
        
        // Add a subtle "voice active" indicator
        this.showVoiceActivity(event.type);
    }

    getVoicePrefix(eventType) {
        switch (eventType) {
            case window.AGUI.EventType.RUN_STARTED:
            case window.AGUI.EventType.RUN_FINISHED:
                return '🎤 ';
            case window.AGUI.EventType.TEXT_MESSAGE_START:
            case window.AGUI.EventType.TEXT_MESSAGE_END:
                return '💬 ';
            case window.AGUI.EventType.TOOL_CALL_START:
            case window.AGUI.EventType.TOOL_CALL_END:
                return '📢 ';
            case window.AGUI.EventType.TOOL_CALL_RESULT:
                return '📣 ';
            default:
                return '🗣️ ';
        }
    }

    showVoiceActivity(eventType) {
        // Add a temporary voice activity indicator to the container
        const voiceActivity = document.createElement('div');
        voiceActivity.className = 'voice-activity-pulse';
        
        // Position it near the voice header
        const voiceHeader = document.querySelector('.voice-header');
        if (voiceHeader) {
            voiceActivity.style.position = 'absolute';
            voiceActivity.style.right = '10px';
            voiceActivity.style.top = '5px';
            voiceHeader.style.position = 'relative';
            voiceHeader.appendChild(voiceActivity);
            
            setTimeout(() => {
                if (voiceActivity.parentElement) {
                    voiceActivity.remove();
                }
            }, 1000);
        }
    }

    clear() {
        this.container.innerHTML = '';
        this.activeMessages.clear();
        this.activeToolCalls.clear();
    }
}