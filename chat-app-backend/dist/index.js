"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoute_1 = require("./userRoute");
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const chatRoute_1 = require("./chatRoute");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!",
});
app.use(limiter);
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use("/api/v1/user", userRoute_1.userRouter);
app.use("/api/v1/chat", chatRoute_1.chatRouter);
const httpServer = app.listen(process.env.PORT, () => {
    console.log(`Port ${process.env.PORT} is listening`);
});
const wss = new ws_1.WebSocketServer({ server: httpServer });
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.on("message", function message(data, isBinary) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });
});
