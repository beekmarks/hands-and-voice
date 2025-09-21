# WebMCP + AG-UI Starter Kit

🚀 **Build transparent AI applications with the power of WebMCP "Hands" and AG-UI "Voice"**

This starter kit provides everything you need to create web applications that integrate AI agents using the **WebMCP (Web Model Context Protocol)** and **AG-UI (Agent-User Interaction) Protocol**. Unlike traditional AI integrations that hide their workings, this architecture makes AI transparent, trustworthy, and truly collaborative.

## 🎯 What You Get

### Core Architecture Components
- **🤲 WebMCP "Hands"** - AI agents that directly interact with your application
- **🗣️ AG-UI "Voice"** - Real-time transparency into AI thinking and actions
- **🔄 Dual-Mode LLM** - Works with both keyword matching (demo) and real AI (OpenAI)
- **📱 Responsive UI** - Professional layout with "Hands vs Voice" visual concepts

### Ready-to-Customize Templates
- **HTML Structure** - Semantic layout with placeholder content
- **CSS Styling** - Complete theming with animation hooks
- **JavaScript Modules** - Modular architecture with clear separation of concerns
- **Integration Patterns** - Best practices for WebMCP tool registration and AG-UI event streaming

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Your App      │    │   AG-UI Client   │    │  Agent Backend  │
│   (The Hands)   │    │   (The Voice)    │    │                 │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │  WebMCP     │◄┼────┼►│  Event       │◄┼────┼►│   LLM       │ │
│ │  Tools      │ │    │ │  Stream      │ │    │ │   Client    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ Your Business   │    │  Transparency    │    │ AI Processing  │
│ Logic           │    │  Layer           │    │ & Orchestration │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Set Up Your Environment
```bash
# Clone or download the starter-kit directory
cd starter-kit

# Serve the files with any HTTP server
python -m http.server 8000
# OR
npx serve .
# OR
php -S localhost:8000
```

### 2. Open and Test
1. Navigate to `http://localhost:8000`
2. Try the demo mode with example prompts
3. Optionally add your OpenAI API key for real AI integration

### 3. Start Customizing
Replace the placeholder content with your actual application logic (see customization guide below).

## 📁 File Structure & Purpose

```
starter-kit/
├── index.html                    # Main HTML template with dual-panel layout
├── css/
│   └── styles.css               # Complete styling with Hands/Voice themes
└── js/
    ├── ag-ui-client.js          # AG-UI Protocol implementation (use as-is)
    ├── webmcp-provider.js       # WebMCP tool management (add your tools)
    ├── your-app.js              # Your application logic (customize heavily)
    ├── llm-client.js            # Dual-mode LLM integration (customize prompts)
    ├── agent-client.js          # Agent orchestration (customize responses)
    └── main.js                  # Application wiring (customize event handling)
```

## 🛠️ Customization Guide

### Step 1: Replace Your Application Logic (`your-app.js`)

```javascript
// Replace the placeholder YourApp class with your actual application
class YourApp {
    constructor(container) {
        // Initialize with your data structure
        this.appState = {
            // Your application's state
            products: [],
            orders: [],
            currentUser: null
            // ... etc
        };
    }

    // Register WebMCP tools that AI can use
    registerWithWebMCP() {
        // Example for e-commerce
        WebMCP.registerTool(
            'searchProducts',
            'Search for products in the catalog',
            async (args) => {
                const results = await this.searchProducts(args.query);
                return { products: results, count: results.length };
            }
        );
    }
}
```

### Step 2: Customize HTML Structure (`index.html`)

Replace the placeholder content in the main application area:

```html
<!-- Replace this placeholder section -->
<div id="your-app">
    <!-- Your actual application UI goes here -->
    <div class="product-grid">
        <!-- Product catalog, dashboard, document list, etc. -->
    </div>
</div>
```

### Step 3: Add Domain-Specific Keywords (`llm-client.js`)

```javascript
// In getToolCallsFromKeywords(), add patterns for your domain
if (lowercasePrompt.includes('product') || lowercasePrompt.includes('catalog')) {
    calls.push({ name: 'searchProducts', args: { query: prompt } });
}

if (lowercasePrompt.includes('order') || lowercasePrompt.includes('purchase')) {
    calls.push({ name: 'createOrder', args: {} });
}
```

### Step 4: Style Your Application (`styles.css`)

The CSS is structured with clear sections. Customize the placeholder content styles:

```css
/* Customize this section for your application */
.placeholder-content {
    /* Replace with your actual application styles */
}

/* Add your domain-specific CSS */
.product-grid { /* ... */ }
.order-summary { /* ... */ }
```

## 💡 Implementation Examples

### E-Commerce Application
```javascript
// WebMCP Tools
WebMCP.registerTool('searchProducts', 'Search product catalog', async (args) => { ... });
WebMCP.registerTool('addToCart', 'Add item to shopping cart', async (args) => { ... });
WebMCP.registerTool('getRecommendations', 'Get product recommendations', async (args) => { ... });

// Keywords
'search', 'find', 'product' → searchProducts
'cart', 'add', 'buy' → addToCart
'recommend', 'suggest' → getRecommendations
```

### Document Management System
```javascript
// WebMCP Tools  
WebMCP.registerTool('searchDocuments', 'Search document library', async (args) => { ... });
WebMCP.registerTool('createFolder', 'Create new folder', async (args) => { ... });
WebMCP.registerTool('shareDocument', 'Share document with users', async (args) => { ... });

// Keywords
'document', 'file', 'search' → searchDocuments  
'folder', 'directory', 'create' → createFolder
'share', 'permission', 'access' → shareDocument
```

### Data Dashboard
```javascript
// WebMCP Tools
WebMCP.registerTool('queryDatabase', 'Execute database query', async (args) => { ... });
WebMCP.registerTool('generateChart', 'Create data visualization', async (args) => { ... });
WebMCP.registerTool('exportData', 'Export data in specified format', async (args) => { ... });

// Keywords
'query', 'data', 'search' → queryDatabase
'chart', 'graph', 'visualize' → generateChart
'export', 'download', 'save' → exportData
```

## 🎨 Visual Design Concepts

### Color Psychology Implementation
- **Green Theme (Hands)** - Represents action, execution, and results
- **Blue Theme (Voice)** - Represents communication, transparency, and trust
- **Flow Connector** - Visual reinforcement of "Hands Execute → Voice Reports"

### Animation Hooks
The starter kit includes CSS classes for dynamic feedback:
- `.updating` - Shows during WebMCP tool execution
- `.content-updated` - Flashes green when content changes
- `.new-content` - Slides in new content sections

## 🔧 Advanced Features

### Real-Time Transparency
Every AI action generates AG-UI events:
```javascript
// The agent automatically streams these events
yield new AGUI.RunStartedEvent(threadId, runId);
yield new AGUI.ToolCallStartEvent(toolCallId, toolName);
yield new AGUI.ToolCallResultEvent(messageId, toolCallId, result);
yield new AGUI.TextMessageContentEvent(messageId, responseText);
```

### Dual-Mode LLM Integration
- **Demo Mode**: Works immediately with keyword matching
- **Real AI Mode**: Full OpenAI GPT integration with natural language

### WebMCP Tool Pattern
```javascript
WebMCP.registerTool(
    'toolName',
    'Clear description for the AI',
    async (args) => {
        // Your business logic here
        const result = await yourFunction(args);
        
        // Return JSON-serializable results
        return { 
            success: true, 
            data: result,
            message: 'Action completed successfully'
        };
    }
);
```

## 🔐 Security Considerations

### API Key Management
- Keys stored only in browser localStorage
- Never transmitted to third-party servers
- Clear rotation instructions provided
- Demo mode available for no-key usage

### Best Practices
- Validate all tool inputs
- Sanitize user prompts
- Implement rate limiting for production
- Use environment variables for server deployments

## 📚 Learning Resources

### Understanding the Concepts
- **WebMCP** - AI agents that can directly manipulate web applications
- **AG-UI** - Standardized events for transparent AI communication  
- **Hands vs Voice** - Visual metaphor for action vs communication

### Extension Points
1. **Add More Tools** - Extend WebMCP.registerTool() calls
2. **Customize UI** - Modify HTML/CSS for your brand
3. **Enhance LLM** - Add support for Claude, Gemini, etc.
4. **Advanced Events** - Use AGUI.StateSnapshotEvent, AGUI.StateDeltaEvent

## 🤔 Common Use Cases

### Content Management
- "Find documents about X" → searchDocuments
- "Create a new project folder" → createFolder  
- "Share this with the team" → shareDocument

### E-Commerce
- "Show me wireless headphones under $100" → searchProducts
- "Add this to my cart" → addToCart
- "What would go well with this?" → getRecommendations

### Business Intelligence  
- "Show sales data for Q3" → queryDatabase
- "Create a revenue chart" → generateChart
- "Export this data as Excel" → exportData

## 🔮 What's Next?

### Immediate Customization
1. Replace `YourApp` with your actual application class
2. Add domain-specific WebMCP tools
3. Customize the visual design and branding
4. Test with your OpenAI API key

### Advanced Enhancements
1. **Multi-Agent Support** - Multiple specialized agents
2. **WebSocket Integration** - Real-time collaboration
3. **State Persistence** - Save/restore application state
4. **Plugin Architecture** - Modular tool loading

### Production Considerations
1. **Authentication** - User management and permissions
2. **Rate Limiting** - Prevent API abuse
3. **Monitoring** - Track agent performance and usage
4. **Scaling** - Handle multiple concurrent users

## 💬 Getting Help

### Debugging Tools
The starter kit includes console debugging functions:
```javascript
// Test individual tools
testAgent.executeTool('yourToolName', { arg: 'value' });

// List all available tools  
testAgent.listTools();

// Test LLM processing
testAgent.testLLM('your test prompt');
```

### Common Issues
1. **Tools not found** - Check WebMCP.registerTool() calls
2. **Events not displaying** - Verify AG-UI event streaming
3. **API key errors** - Check OpenAI key format (starts with 'sk-')
4. **Styling issues** - Ensure CSS classes match HTML structure

---

## 🌟 The Vision

This starter kit represents more than just code - it's a **blueprint for the future of human-AI collaboration**. By combining WebMCP's direct action capabilities with AG-UI's transparency features, you're building applications where AI becomes a visible, understandable partner rather than a mysterious black box.

**What will you build with transparent AI?**

The technology is here. The patterns are proven. The only limit is your imagination.

---

*Built with ❤️ for the future of human-AI collaboration*