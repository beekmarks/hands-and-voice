/**
 * AG-UI Client Library Implementation
 * Based on the official AG-UI Protocol (https://github.com/ag-ui-protocol/ag-ui)
 * 
 * This file implements the core AG-UI Protocol event types and classes.
 * It should generally be used as-is, as it provides the standard protocol
 * implementation that enables transparent AI communication.
 * 
 * USAGE:
 * - Import this file before other modules that use AG-UI events
 * - Use the event classes to create protocol-compliant events
 * - Stream events to create transparent AI experiences
 * 
 * The AG-UI Protocol provides standardized events for:
 * - Run lifecycle (started, finished, error)
 * - Text message streaming (start, content, end)
 * - Tool call transparency (start, args, end, result)
 * - State management (snapshots, deltas)
 */

// AG-UI Protocol Event Types
const EventType = {
  // Lifecycle events
  RUN_STARTED: 'RUN_STARTED',
  RUN_FINISHED: 'RUN_FINISHED',
  RUN_ERROR: 'RUN_ERROR',
  STEP_STARTED: 'STEP_STARTED',
  STEP_FINISHED: 'STEP_FINISHED',

  // Text message events
  TEXT_MESSAGE_START: 'TEXT_MESSAGE_START',
  TEXT_MESSAGE_CONTENT: 'TEXT_MESSAGE_CONTENT',
  TEXT_MESSAGE_END: 'TEXT_MESSAGE_END',
  TEXT_MESSAGE_CHUNK: 'TEXT_MESSAGE_CHUNK',

  // Tool call events
  TOOL_CALL_START: 'TOOL_CALL_START',
  TOOL_CALL_ARGS: 'TOOL_CALL_ARGS',
  TOOL_CALL_END: 'TOOL_CALL_END',
  TOOL_CALL_RESULT: 'TOOL_CALL_RESULT',

  // State management events
  STATE_SNAPSHOT: 'STATE_SNAPSHOT',
  STATE_DELTA: 'STATE_DELTA',
  MESSAGES_SNAPSHOT: 'MESSAGES_SNAPSHOT',

  // Special events
  RAW: 'RAW',
  CUSTOM: 'CUSTOM'
};

// Base Event structure
class BaseEvent {
  constructor(type, timestamp = Date.now(), rawEvent = null) {
    this.type = type;
    this.timestamp = timestamp;
    this.rawEvent = rawEvent;
  }
}

// Specific Event Classes following AG-UI Protocol
class RunStartedEvent extends BaseEvent {
  constructor(threadId, runId, timestamp) {
    super(EventType.RUN_STARTED, timestamp);
    this.threadId = threadId;
    this.runId = runId;
  }
}

class RunFinishedEvent extends BaseEvent {
  constructor(threadId, runId, result = null, timestamp) {
    super(EventType.RUN_FINISHED, timestamp);
    this.threadId = threadId;
    this.runId = runId;
    this.result = result;
  }
}

class RunErrorEvent extends BaseEvent {
  constructor(threadId, runId, error, timestamp) {
    super(EventType.RUN_ERROR, timestamp);
    this.threadId = threadId;
    this.runId = runId;
    this.error = error;
  }
}

class TextMessageStartEvent extends BaseEvent {
  constructor(messageId, role = 'assistant', timestamp) {
    super(EventType.TEXT_MESSAGE_START, timestamp);
    this.messageId = messageId;
    this.role = role;
  }
}

class TextMessageContentEvent extends BaseEvent {
  constructor(messageId, delta, timestamp) {
    super(EventType.TEXT_MESSAGE_CONTENT, timestamp);
    this.messageId = messageId;
    this.delta = delta;
  }
}

class TextMessageEndEvent extends BaseEvent {
  constructor(messageId, timestamp) {
    super(EventType.TEXT_MESSAGE_END, timestamp);
    this.messageId = messageId;
  }
}

class ToolCallStartEvent extends BaseEvent {
  constructor(toolCallId, toolCallName, parentMessageId = null, timestamp) {
    super(EventType.TOOL_CALL_START, timestamp);
    this.toolCallId = toolCallId;
    this.toolCallName = toolCallName;
    this.parentMessageId = parentMessageId;
  }
}

class ToolCallArgsEvent extends BaseEvent {
  constructor(toolCallId, delta, timestamp) {
    super(EventType.TOOL_CALL_ARGS, timestamp);
    this.toolCallId = toolCallId;
    this.delta = delta;
  }
}

class ToolCallEndEvent extends BaseEvent {
  constructor(toolCallId, timestamp) {
    super(EventType.TOOL_CALL_END, timestamp);
    this.toolCallId = toolCallId;
  }
}

class ToolCallResultEvent extends BaseEvent {
  constructor(messageId, toolCallId, result, timestamp) {
    super(EventType.TOOL_CALL_RESULT, timestamp);
    this.messageId = messageId;
    this.toolCallId = toolCallId;
    this.result = result;
  }
}

// State management events
class StateSnapshotEvent extends BaseEvent {
  constructor(state, timestamp) {
    super(EventType.STATE_SNAPSHOT, timestamp);
    this.state = state;
  }
}

class StateDeltaEvent extends BaseEvent {
  constructor(delta, timestamp) {
    super(EventType.STATE_DELTA, timestamp);
    this.delta = delta;
  }
}

// Custom event for application-specific needs
class CustomEvent extends BaseEvent {
  constructor(message, data = null, timestamp) {
    super(EventType.CUSTOM, timestamp);
    this.message = message;
    this.data = data;
  }
}

// Export AG-UI classes globally
if (typeof window !== 'undefined') {
  window.AGUI = {
    EventType,
    BaseEvent,
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    ToolCallStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ToolCallResultEvent,
    StateSnapshotEvent,
    StateDeltaEvent,
    CustomEvent
  };
}

/**
 * USAGE EXAMPLES:
 * 
 * // Creating and streaming AG-UI events
 * async function* streamAgentProcess(userInput) {
 *   const threadId = 'thread_' + Date.now();
 *   const runId = 'run_' + Date.now();
 * 
 *   // Start the run
 *   yield new AGUI.RunStartedEvent(threadId, runId);
 * 
 *   // Start a tool call
 *   const toolCallId = 'tool_' + Date.now();
 *   yield new AGUI.ToolCallStartEvent(toolCallId, 'searchData', 'msg_123');
 *   yield new AGUI.ToolCallArgsEvent(toolCallId, JSON.stringify({query: userInput}));
 * 
 *   // Execute tool (your business logic here)
 *   const result = await executeSearch(userInput);
 * 
 *   yield new AGUI.ToolCallEndEvent(toolCallId);
 *   yield new AGUI.ToolCallResultEvent('msg_123', toolCallId, JSON.stringify(result));
 * 
 *   // Stream response
 *   const messageId = 'response_' + Date.now();
 *   yield new AGUI.TextMessageStartEvent(messageId);
 *   yield new AGUI.TextMessageContentEvent(messageId, 'I found the data you requested...');
 *   yield new AGUI.TextMessageEndEvent(messageId);
 * 
 *   // Finish the run
 *   yield new AGUI.RunFinishedEvent(threadId, runId);
 * }
 */