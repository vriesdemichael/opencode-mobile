const http = require("http");

const PORT = 3000;

// Hardcoded test data
const MOCK_PROJECT = {
    id: "proj_123",
    worktree: "/home/user/projects/test",
    status: "ready",
};

const MOCK_SESSION = {
    id: "sess_123",
    title: "Test Session",
    directory: "/home/user/projects/test",
    slug: "test-session",
    time: {
        created: Date.now(),
        updated: Date.now(),
    },
    status: "ready",
};

const MOCK_MESSAGE = {
    info: {
        id: "msg_123",
        role: "assistant",
        time: {
            created: Date.now(),
        },
        summary: "Mock message summary",
    },
    parts: [
        {
            sessionID: "sess_123",
            text: "Hello, this is a simulated response.",
        },
    ],
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type,Authorization"
    );

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`[Mock Server] ${req.method} ${req.url}`);

    res.setHeader("Content-Type", "application/json");

    // Basic router
    if (req.method === "GET" && req.url === "/global/health") {
        res.writeHead(200);
        res.end(JSON.stringify({ healthy: true }));
        return;
    }

    if (req.method === "GET" && req.url === "/project") {
        res.writeHead(200);
        res.end(JSON.stringify([MOCK_PROJECT]));
        return;
    }

    if (req.method === "GET" && req.url.startsWith("/session")) {
        // Mock list
        if (req.url === "/session" || req.url.startsWith("/session?")) {
            res.writeHead(200);
            res.end(JSON.stringify([MOCK_SESSION]));
            return;
        }

        // Mock single session messages
        if (req.url.match(/^\/session\/[^/]+\/message$/)) {
            res.writeHead(200);
            res.end(JSON.stringify([MOCK_MESSAGE]));
            return;
        }

        // Mock single session details
        if (req.url.match(/^\/session\/[^/]+$/)) {
            res.writeHead(200);
            res.end(JSON.stringify(MOCK_SESSION));
            return;
        }
    }

    if (req.method === "POST" && req.url === "/session") {
        res.writeHead(201);
        res.end(JSON.stringify(MOCK_SESSION));
        return;
    }

    if (req.method === "POST" && req.url.match(/^\/session\/[^/]+\/prompt_async$/)) {
        res.writeHead(204); // No content = success
        res.end();
        return;
    }

    if (req.method === "GET" && req.url === "/global/event") {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.writeHead(200);
        res.write("data: connected\n\n");

        // Keep alive without crashing
        const interval = setInterval(() => {
            res.write(":\n\n");
        }, 10000);

        req.on("close", () => clearInterval(interval));
        return;
    }

    // 404 fallback
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Mock server running at http://0.0.0.0:${PORT}/`);
});
