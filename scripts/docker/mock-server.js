import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

let clients = [];
let sessions = [];
const messages = {};

app.get("/project", (_req, res) => {
	res.json([
		{
			id: "proj_1",
			worktree: "/tmp/test",
			time: { created: Date.now(), updated: Date.now() },
		},
	]);
});

app.get("/project/current", (_req, res) => {
	res.json({
		id: "proj_1",
		worktree: "/tmp/test",
		time: { created: Date.now(), updated: Date.now() },
	});
});

app.get("/session", (_req, res) => {
	res.json(sessions);
});

app.post("/session", (req, res) => {
	const session = {
		id: `sess_${Date.now()}`,
		slug: "test-session",
		projectID: "proj_1",
		directory: "/tmp/test",
		title: req.body.title || "New Session",
		version: "1",
		time: { created: Date.now(), updated: Date.now() },
		status: { status: "idle" },
	};
	sessions.push(session);
	messages[session.id] = [];
	res.json(session);
});

app.get("/session/:id", (req, res) => {
	const session = sessions.find((s) => s.id === req.params.id) || sessions[0];
	res.json(session);
});

app.get("/session/:id/message", (req, res) => {
	res.json(messages[req.params.id] || []);
});

app.delete("/session/:id", (req, res) => {
	sessions = sessions.filter((s) => s.id !== req.params.id);
	res.status(204).send();
});

app.get("/provider", (_req, res) => {
	res.json({
		all: [
			{
				id: "mock",
				name: "Mock Provider",
				models: {
					"mock-model": {
						id: "mock-model",
						providerID: "mock",
						name: "Mock Model",
						status: "active",
					},
				},
			},
		],
	});
});

app.get("/global/event", (req, res) => {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});

	clients.push(res);

	res.write(`event: server.connected\ndata: {}\n\n`);

	req.on("close", () => {
		clients = clients.filter((c) => c !== res);
	});
});

app.post("/session/:id/prompt_async", (req, res) => {
	const sessionId = req.params.id;
	const promptText = req.body.parts?.[0]?.text || "";

	res.status(204).send();

	// Broadcast user message
	const userMsg = {
		sessionID: sessionId,
		message: {
			info: {
				id: `msg_${Date.now()}_u`,
				role: "user",
				time: { created: Date.now() },
			},
			parts: [
				{
					id: `part_${Date.now()}_u`,
					sessionID: sessionId,
					messageID: `msg_${Date.now()}_u`,
					type: "text",
					text: promptText,
				},
			],
		},
	};

	if (!messages[sessionId]) messages[sessionId] = [];
	messages[sessionId].push(userMsg.message);

	clients.forEach((c) => {
		c.write(`event: message.created\ndata: ${JSON.stringify(userMsg)}\n\n`);
	});

	// Simulate assistant replying after 1s
	setTimeout(() => {
		const asstMsg = {
			sessionID: sessionId,
			message: {
				info: {
					id: `msg_${Date.now()}_a`,
					role: "assistant",
					time: { created: Date.now() },
				},
				parts: [
					{
						id: `part_${Date.now()}_a`,
						sessionID: sessionId,
						messageID: `msg_${Date.now()}_a`,
						type: "text",
						text: "This is a mock response from the server.",
					},
				],
			},
		};
		messages[sessionId].push(asstMsg.message);
		clients.forEach((c) => {
			c.write(`event: message.created\ndata: ${JSON.stringify(asstMsg)}\n\n`);
		});
	}, 1000);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Mock server running on port ${PORT}`);
});
