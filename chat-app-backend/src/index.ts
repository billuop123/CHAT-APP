import express from "express";
import { userRouter } from "./userRoute";
import cors from "cors";
import { WebSocket, WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import { chatRouter } from "./chatRoute";
import rateLimit from "express-rate-limit";

const app = express();
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use(limiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
const httpServer = app.listen(process.env.PORT, () => {
  console.log(`Port ${process.env.PORT} is listening`);
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});
