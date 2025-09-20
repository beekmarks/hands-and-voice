/**
 * WebMCP Provider Implementation
 * Bridges WebMCP (Web Model Context Protocol) with AG-UI Protocol
 */

class WebMCPProvider {
  constructor() {
    this.tools = new Map();
    this.sessions = new Map();
  }

  // Register WebMCP tools that can be called by agents
  registerTool(name, description, execute) {
    this.tools.set(name, {
      name,
      description,
      execute
    });
  }

  // Get available tools for agent execution
  getTools() {
    return Array.from(this.tools.values());
  }

  // Execute a tool and return results
  async executeTool(name, args = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }
    
    try {
      return await tool.execute(args);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }

  // Create a new WebMCP session
  createSession(sessionId, config = {}) {
    const session = {
      id: sessionId,
      config,
      createdAt: Date.now(),
      tools: this.getTools()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  // Get session information
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Clean up session
  destroySession(sessionId) {
    return this.sessions.delete(sessionId);
  }
}

// Global WebMCP Provider instance
if (typeof window !== 'undefined') {
  window.WebMCP = new WebMCPProvider();
}