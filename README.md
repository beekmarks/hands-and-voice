# Fidelity WebMCP + AG-UI Protocol POC

## 🌟 The Vision: From Black Box to Transparent Collaborator

Have you ever wished for a smart AI assistant that works **directly inside** your web applications - not just alongside them, but truly understanding and interacting with the same interface you're using? This proof-of-concept demonstrates a revolutionary approach to human-AI collaboration that transforms AI from a mysterious "black box" into a **transparent, trustworthy partner** working right beside you in your digital workspace.

This POC integrates **WebMCP (Web Model Context Protocol)** with the **AG-UI (Agent-User Interaction) Protocol** to create what we call a **high-fidelity interaction loop** - where AI agents can both act within web applications and clearly communicate their every step to users in real-time.

https://github.com/user-attachments/assets/b87ed16a-e5d9-4d4f-9146-542aaf47a4b2

## 🎯 What This Demonstrates: The Future of AI Integration

### The Two-Protocol Foundation

**🤖 WebMCP: The AI's "Hands"**
- Gives AI agents the ability to **directly interact** with web application logic
- No expensive backend APIs required ($10,000-$100,000+ savings)
- Reuses existing client-side JavaScript functions that already power your UI
- Transforms agents from passive data consumers into **active users** of your application

**👁️ AG-UI: The AI's "Voice"**  
- Provides **real-time transparency** into what the agent is thinking and doing
- Eliminates the "black box" problem through standardized event streaming
- Creates trust through visibility - see every tool call, every decision, every step
- Enables **truly responsive UIs** that update as the agent works

### Key Innovations Demonstrated

- **Unified Context**: Agent and human work with the same application state
- **Economic Efficiency**: Leverages existing UI investments instead of building new APIs  
- **Architectural Modularity**: Clean separation between action (WebMCP) and observation (AG-UI)
- **Transport Agnostic**: Works over WebSockets, Server-Sent Events, or any message system
- **Interchangeable Components**: Swap LLMs, UIs, or tools without breaking the system

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Fidelity App   │    │   AG-UI Client   │    │  Agent Backend  │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │   WebMCP    │◄┼────┼►│  Event       │◄┼────┼►│    LLM      │ │
│ │   Tools     │ │    │ │  Stream      │ │    │ │   Client    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ Portfolio Mgmt  │    │  Real-time UI    │    │ Tool Execution  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 AG-UI Protocol Events Implemented

### Lifecycle Events
- `RUN_STARTED` - Agent begins processing
- `RUN_FINISHED` - Agent completes processing 
- `RUN_ERROR` - Error occurs during processing

### Text Message Events
- `TEXT_MESSAGE_START` - Begin streaming text response
- `TEXT_MESSAGE_CONTENT` - Streaming text chunks
- `TEXT_MESSAGE_END` - Complete text response

### Tool Call Events
- `TOOL_CALL_START` - Begin tool execution
- `TOOL_CALL_ARGS` - Tool arguments being passed
- `TOOL_CALL_END` - Tool execution complete
- `TOOL_CALL_RESULT` - Tool execution results

## 🛠️ WebMCP Tools Available

### 1. Portfolio Management
- **`getPortfolio`** - Retrieve current allocation and metrics
- **`rebalancePortfolio`** - Adjust allocation based on risk strategy
- **`getRetirementProjection`** - Calculate retirement savings projections

### 2. Strategy Options
- **Conservative**: 40% stocks, 40% bonds, 20% cash
- **Moderate**: 60% stocks, 30% bonds, 10% cash  
- **Aggressive**: 70% stocks, 20% bonds, 10% cash

## 🚀 Experience the Future of AI Collaboration

### Quick Start: See Transparency in Action

1. **Launch the Experience**
   ```bash
   # Serve the files with any HTTP server, e.g.:
   python -m http.server 8000
   # or
   npx serve .
   ```

2. **Choose Your Mode**
   - **🤖 Real AI Mode**: Add your OpenAI API key for natural language understanding
   - **⚡ Demo Mode**: Use keyword matching for instant exploration
   - **🔐 Security Note**: All keys stay in your browser - never shared with external servers

3. **Experience Transparent AI**
   
   **Try Natural Conversations:**
   - "Can you show me how my portfolio is performing?"
   - "I want to be more aggressive with my investments" 
   - "What would retirement look like if I save $1000 monthly?"
   - "Switch to a safer investment strategy"

   **Watch the Magic Happen:**
   - See the agent **plan** its approach (🎯 Run Started)
   - Observe **tool selection** and execution (🔧 Tool Calls)  
   - Track **real-time thinking** (💭 Message Streaming)
   - View **state changes** as they happen (📊 Results)

4. **Discover the High-Fidelity Loop**
   
   Notice how every interaction follows the same transparent pattern:
   ```
   Your Input → Agent Planning → UI Notification → 
   Tool Execution → State Update → Result Communication
   ```
   
   This isn't just a demo - it's a **blueprint for trustworthy AI** that you can see, understand, and verify.

## 🔐 Security: From POC to Production

**This POC is for demonstration only** - the security model is intentionally simplified to focus on architectural concepts. 

### For Development & Testing
- API keys stored in browser localStorage (never sent externally)
- No backend authentication required
- Safe for local experimentation and learning

### For Production Deployment
The WebMCP + AG-UI architecture introduces unique security challenges that require careful attention:

- **🎯 Prompt Injection Prevention**: AI agents executing tools need strict input validation
- **🔒 Secure Tool Design**: Context-aware authorization and human-in-the-loop controls  
- **🛡️ API Security**: Backend proxy patterns and secret management
- **📊 Monitoring & Rate Limiting**: Comprehensive audit trails and abuse prevention

**📋 Required Reading**: Before deploying to production, review the comprehensive **[Security Implementation Guide](./SECURITY.md)** which provides:
- Detailed threat vector analysis and mitigation strategies
- Production hardening checklist with 10 critical security controls
- Secure development lifecycle integration guidelines
- Code examples for secure tool implementation patterns

### 🔑 API Key Security

**IMPORTANT**: This POC stores API keys in browser localStorage for demonstration purposes only. This is NOT suitable for production use.

- **Get your key**: Visit [OpenAI API Keys](https://platform.openai.com/api-keys)  
- **Demo only**: Keys stored locally, never transmitted to external servers
- **Production ready?**: See [SECURITY.md](./SECURITY.md) for comprehensive security implementation guide

**⚠️ For Production Deployments**: The security model demonstrated in this POC is inadequate for production use. Before deploying any application based on this architecture, review the comprehensive [Security Implementation Guide](./SECURITY.md) which covers threat analysis, mitigation strategies, and production hardening requirements.

## 💡 Key Features

### 🤲 Visual "Hands vs Voice" Concept Manifestation
This POC makes the abstract concepts concrete through visual design:

**WebMCP "Hands" (Left Panel):**
- **Green themed interface** with hands emoji (🤲) 
- **"Hands at work" overlays** appear during tool execution
- **Action-focused animations** (⚖️ Rebalancing, 📊 Calculating)
- **Real DOM updates** with highlighting and pulse effects

**AG-UI "Voice" (Right Panel):**
- **Blue themed interface** with voice emoji (🗣️)
- **Dual transparency views**: Technical events + Clean chat
- **Voice indicators** on every protocol event (🎤, 💬, 📢)
- **Real-time streaming** with speaking animations

**Interactive Educational Elements:**
- **Expandable explainer** teaching Hands vs Voice concepts
- **Visual flow connector** showing "Hands Execute → Voice Reports"
- **Contextual tooltips** reinforcing architectural principles

### Enhanced Portfolio Features
- **Current allocation display** with visual updates
- **Total portfolio value calculation** 
- **Risk level assessment** with color coding
- **Change history tracking** with slide-in animations
- **Retirement projections** with detailed breakdowns and highlighting

### Real-time Agent Transparency
The AG-UI panel shows each step of agent processing:
- 🚀 When the agent starts (`RUN_STARTED`)
- 🔧 Which tools are being called (`TOOL_CALL_START`)
- ⚙️ What arguments are passed (`TOOL_CALL_ARGS`)
- 📊 Tool execution results (`TOOL_CALL_RESULT`)
- 💬 Agent responses (`TEXT_MESSAGE_*`)
- ✅ When processing completes (`RUN_FINISHED`)

### Natural Language Processing
The LLM client recognizes various command patterns:
- Portfolio viewing: "show portfolio", "display allocation"
- Rebalancing: "make more aggressive", "rebalance conservative"
- Retirement planning: "retirement projection", "plan for 20 years"

## 🤖 LLM Integration Modes

### Keyword Matching Mode (Default)
- **No API key required**
- Pattern-based command recognition
- Instant responses
- Perfect for demonstrations

### OpenAI Integration Mode  
- **Real GPT-3.5 Turbo integration**
- Natural language understanding
- Tool calling via OpenAI Functions API
- Intelligent response generation
- Streaming responses with realistic delays

### Example Natural Language Commands (LLM Mode)
- "Can you show me how my portfolio is doing?"
- "I want to be more aggressive with my investments"
- "What would my retirement look like in 30 years if I save $1000 monthly?"
- "Switch to a safer investment strategy"

## 🔧 Technical Implementation

### AG-UI Protocol Compliance
```javascript
// Event creation follows AG-UI specification
yield new AGUI.RunStartedEvent(threadId, runId);
yield new AGUI.ToolCallStartEvent(toolCallId, toolName, messageId);
yield new AGUI.ToolCallArgsEvent(toolCallId, JSON.stringify(args));
yield new AGUI.ToolCallEndEvent(toolCallId);
yield new AGUI.ToolCallResultEvent(messageId, toolCallId, result);
```

### WebMCP Tool Registration
```javascript
WebMCP.registerTool(
    'getPortfolio',
    'Get current portfolio allocation and metrics',
    async () => { /* implementation */ }
);
```

## 📁 File Structure

```
ag-ui/
├── index.html                    # Main application layout with Hands/Voice UI
├── README.md                     # This comprehensive guide
├── ARCHITECTURE.md               # Detailed technical architecture
├── SECURITY.md                   # API key security guidelines
├── css/
│   └── styles.css               # Styling with Hands/Voice themes & animations
└── js/                          # JavaScript modules
    ├── ag-ui-client.js          # AG-UI protocol implementation
    ├── webmcp-provider.js       # WebMCP tool management
    ├── fidelity-app.js          # Portfolio logic with visual feedback
    ├── agent-client.js          # Agent processing with AG-UI events
    ├── llm-client.js            # Dual-mode LLM integration
    └── main.js                  # Application orchestration & UI management
```

## 🎨 Visual Design & User Experience

### Conceptual Visual Framework
- **Hands vs Voice metaphors** implemented throughout the interface
- **Color psychology**: Green for action (Hands), Blue for communication (Voice)
- **Conceptual headers** with emoji and explanatory subtitles
- **Interactive educational content** with expandable concept explanations

### Advanced UI Interactions  
- **Animated DOM updates** with flash, pulse, and slide effects
- **"Hands at work" overlays** during WebMCP tool execution
- **Voice activity indicators** during AG-UI event streaming
- **Dual transparency modes**: Technical events + Clean conversation
- **Flow visualization** showing Hands→Voice relationship

### Professional Design Elements
- **Responsive layout** constrained to viewport width
- **Financial UI aesthetics** appropriate for Fidelity branding  
- **Real-time streaming** with speaking animations
- **Color-coded events** for immediate identification
- **Smooth transitions** and non-intrusive feedback

## 🌐 The Broader Vision: Transforming Digital Collaboration

### Beyond Automation: True Augmentation
This isn't just about automating tasks away - it's about **empowering people with AI partners** that work transparently alongside them. Imagine a web where every application you use could offer its own intelligent co-pilot, explaining what it's doing as it goes.

### The Three-Layer Future
This POC demonstrates part of an emerging **layered framework for agent communication**:

1. **🤖 MCP Layer (The Hands)** - Agents access tools, APIs, and act on the world
2. **🤝 A2A Layer (The Colleagues)** - Agents communicate and delegate to each other  
3. **👁️ AG-UI Layer (The Voice)** - All activity becomes visible and understandable to humans

### Real-World Impact Scenarios

**E-Commerce**: Upload a photo and ask "find dresses like this one" - watch the agent analyze the image, query products, and display results in real-time.

**Design Tools**: Request "show me Spring templates with white backgrounds" and observe as the agent filters, searches, and presents options while explaining each step.

**Development**: Ask "why are tests failing on mobile?" and see the agent examine logs, identify issues, and even suggest code fixes - all transparently.

**Financial Planning**: This POC shows how complex portfolio management becomes conversational while maintaining full visibility into calculations and decisions.

### What Makes This Different

- **No Backend API Required**: Dramatically reduces implementation costs and complexity
- **Unified State Management**: Agent and human always see the same data  
- **Real-time Collaboration**: Like having a knowledgeable colleague who narrates their work
- **Trust Through Transparency**: Every decision and action is visible and understandable
- **Modular Architecture**: Swap components without rebuilding the entire system

## �️ Build Your Own: Starter Kit Available

Ready to build your own transparent AI application? This repository includes a **comprehensive starter kit** that strips away the Fidelity-specific details while preserving all the core WebMCP + AG-UI architectural patterns.

### 🎯 What's in the Starter Kit

Located in the [`starter-kit/`](./starter-kit/) directory, you'll find:

- **📁 Complete Template Files** - HTML, CSS, and JavaScript modules ready for customization
- **🏗️ Architectural Skeleton** - WebMCP tools, AG-UI events, and LLM integration patterns
- **📚 Comprehensive Documentation** - Step-by-step customization guide and implementation examples
- **🤖 AI Tutor Prompt** - Use with ChatGPT/Claude for guided development assistance
- **🎨 Visual Framework** - "Hands vs Voice" design system with animation hooks

### 🚀 Quick Start with Starter Kit

```bash
# Navigate to the starter kit
cd starter-kit

# Start local development server
python -m http.server 8000

# Open http://localhost:8000 and start customizing!
```

### 💡 Perfect for Any Domain

The starter kit provides templates and examples for:
- **E-Commerce** - Product search, cart management, recommendations
- **Document Management** - File operations, folder creation, sharing  
- **Data Dashboards** - Query execution, visualization, exports
- **Task Management** - Project tracking, assignments, workflows
- **Your Domain** - Easily adaptable architectural patterns

### 📖 Learning Resources

- **[Starter Kit README](./starter-kit/README.md)** - Complete implementation guide
- **[AI Tutor Prompt](./starter-kit/AI_TUTOR_PROMPT.md)** - Copy-paste into any LLM for guided development
- **Working POC** - This Fidelity demo shows the patterns in action

### 🎓 Guided Development Experience

Use the included AI tutor prompt with ChatGPT, Claude, or any LLM to get:
- **Step-by-step implementation guidance** tailored to your application domain  
- **Code examples and patterns** specific to your use case
- **Debugging assistance** when you encounter issues
- **Best practices** for WebMCP tool design and AG-UI event streaming

**The starter kit transforms the concepts demonstrated in this POC into a practical foundation for building any transparent AI application.** Whether you're creating the next generation of e-commerce experiences, document workflows, or data analysis tools, the architectural patterns are universal and ready for your innovation.

## �🔮 Future Enhancements

### Technical Evolution
- Integration with real LLM APIs (OpenAI, Claude, etc.)
- More sophisticated financial tools and calculations
- State synchronization events (`STATE_SNAPSHOT`, `STATE_DELTA`)
- WebSocket transport for production deployments  
- Integration with actual WebMCP servers
- Authentication and security layers

### Architectural Patterns
- **Browser Extension Architecture**: Universal assistant working across any WebMCP-enabled site
- **Embedded In-Page Architecture**: Deep integration as first-party application features
- **Multi-Agent Collaboration**: Teams of specialized agents working together transparently

## 🤔 A Question for You

As you explore this POC, consider: **What possibilities could transparent, in-app AI agents unlock in your daily digital workflows?** 

Think about the applications you use most - whether for work, creativity, or managing your life. Where could an AI partner that works **with you, not just for you** make the biggest difference? How might your relationship with technology change when AI becomes a visible, understandable collaborator rather than a mysterious black box?

This isn't just about making computers smarter - it's about making our increasingly complex digital lives **more intuitive, less overwhelming, and genuinely collaborative**.

## 📚 References & Further Reading

- [WebMCP Official Repository](https://github.com/webmachinelearning/webmcp) - Official WebMCP specification and implementation
- [AG-UI Protocol Repository](https://github.com/ag-ui-protocol/ag-ui) - Official protocol specification
- [AG-UI Documentation](https://ag-ui.com/) - Implementation guides and examples
- [Model Context Protocol](https://modelcontextprotocol.io/) - WebMCP foundation and standards
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) - LLM tool integration patterns

## 🌟 The Bottom Line

This POC represents more than a technical demonstration - it's a **glimpse into a future where AI agents become transparent, trustworthy partners embedded directly in our applications**. By combining WebMCP's action capabilities with AG-UI's transparency features, we're not just building better AI tools - we're **fundamentally reimagining how humans and artificial intelligence collaborate**.

The technology exists. The protocols are defined. The only question remaining is: **What will you build with truly transparent AI?**

---

*Experience the future of human-AI collaboration. See every step. Understand every decision. Trust through transparency.*
