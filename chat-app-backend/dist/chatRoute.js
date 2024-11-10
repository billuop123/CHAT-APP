"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const prisma = new client_1.PrismaClient();
exports.chatRouter = express_1.default.Router();
exports.chatRouter.post("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, from, message } = req.body;
    try {
        const chat = yield prisma.chat.create({
            data: {
                to,
                from,
                message,
                time: new Date(),
            },
        });
        res.status(200).json({ chat });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add chat message" });
    }
}));
exports.chatRouter.get("/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const messages = yield prisma.chat.findMany({
            where: {
                OR: [{ to: username }, { from: username }],
            },
        });
        res.status(200).json({ messages });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve messages" });
    }
}));
exports.chatRouter.post("/personal", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username1, username2 } = req.body; // Using query params for GET requests
    if (!username1 || !username2) {
        return res
            .status(400)
            .json({ message: "Both username1 and username2 are required" });
    }
    try {
        const messages = yield prisma.chat.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { from: username1, to: username2 },
                            { from: username2, to: username1 },
                        ],
                    },
                ],
            },
        });
        return res.status(200).json({ messages });
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            message: "An error occurred while fetching messages",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}));
// Ensure proper disconnection on server shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    process.exit();
}));
