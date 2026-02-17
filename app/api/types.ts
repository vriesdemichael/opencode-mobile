export type Project = {
	id: string;
	name: string;
	directory: string;
	icon?: string;
};

export type SessionInfo = {
	id: string;
	title?: string;
	directory: string;
	updatedAt: number;
	createdAt: number;
	userID?: string;
	parentID?: string;
	status?: SessionStatus;
};

export type SessionStatus = {
	status: "active" | "idle" | "completed" | "error";
};

export type MessageInfo = {
	id: string;
	sessionID: string;
	role: "user" | "assistant";
	createdAt: number;
	modelID?: string; // for assistant
	providerID?: string; // for assistant
	error?: {
		name: string;
		message: string;
	};
};

export type MessagePartBase = {
	id: string;
	sessionID: string;
	messageID: string;
};

export type TextPart = MessagePartBase & {
	type: "text";
	text: string;
};

export type ToolPart = MessagePartBase & {
	type: "tool";
	callID: string;
	tool: string;
	state:
		| { status: "pending"; input: Record<string, any>; raw: string }
		| { status: "running"; input: Record<string, any>; time: { start: number } }
		| {
				status: "completed";
				input: Record<string, any>;
				output: string;
				time: { start: number; end: number };
		  }
		| {
				status: "error";
				input: Record<string, any>;
				error: string;
				time: { start: number; end: number };
		  };
};

export type PatchPart = MessagePartBase & {
	type: "patch";
	hash: string;
	files: string[];
};

export type MessagePart = TextPart | ToolPart | PatchPart;

export type Message = {
	info: MessageInfo;
	parts: MessagePart[];
};

// Complete message with potential tool results/content
export type MessageWithParts = Message;

// --- SSE Events ---

export type GlobalEvent =
	| { type: "server.connected"; properties: {} }
	| { type: "server.heartbeat"; properties: {} }
	| {
			type: "message.part.delta";
			properties: {
				sessionID: string;
				messageID: string;
				partID: string;
				delta: string;
			};
	  }
	| {
			type: "message.part.updated";
			properties: {
				part: MessagePart;
			};
	  }
	| {
			type: "session.status";
			properties: {
				sessionID: string;
				status: SessionStatus;
			};
	  };
