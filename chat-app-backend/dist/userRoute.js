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
exports.userRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("redis");
const zod_1 = require("zod");
const redisClient = (0, redis_1.createClient)();
redisClient.on("error", (err) => console.error("Redis error:", err));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.connect();
        console.log("Connected to Redis");
    }
    catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
}))();
exports.userRouter = express_1.default.Router();
const userSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const validationResult = userSchema.safeParse({ username, password });
    if (!validationResult.success)
        return res.status(400).json({
            error: validationResult.error.errors[0].message,
        });
    if (password.length <= 6) {
        return res.json({
            error: "password should be of more than 6 chars",
        });
    }
    const prisma = new client_1.PrismaClient();
    const oldUser = yield prisma.user.findFirst({
        where: {
            username,
        },
    });
    if (oldUser) {
        return res.json({
            error: "User already exists",
        });
    }
    const token = jsonwebtoken_1.default.sign({ username }, "jwtsecret", {
        expiresIn: 5 * 24 * 60 * 60 * 1000,
    });
    // res.cookie("jwt", token, {
    //   expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    // });
    try {
        const newUser = yield prisma.user.create({
            data: {
                username,
                password,
            },
        });
        return res.json({
            newUser,
            status: "success",
            token,
        });
    }
    catch (err) {
        return res
            .status(500)
            .json({ error: "There was an error creating the user" });
    }
}));
// Initialize PrismaClient once at the top of the file
// Route handler
exports.userRouter.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    try {
        const allUsers = yield prisma.user.findMany({});
        res.status(200).json({
            allUsers,
        });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    const { username, password } = req.body;
    const user = yield prisma.user.findFirst({
        where: {
            username,
            password,
        },
    });
    if (!user) {
        return res.status(400).json({
            msg: "No such user",
        });
    }
    const token = jsonwebtoken_1.default.sign({ username }, "jwtsecret", {
        expiresIn: 5 * 24 * 60 * 60 * 1000,
    });
    // res.cookie("jwt", token, {
    //   expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    // });
    return res.status(200).json({
        msg: "successfully logged in ",
        token,
    });
}));
exports.userRouter.get("/user-info/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    console.log(username);
    const prisma = new client_1.PrismaClient();
    const user = yield prisma.user.findFirst({
        where: {
            username,
        },
    });
    return res.json({
        user,
    });
}));
exports.userRouter.post("/usernames", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.body;
    const cacheKey = `messages:${user}`;
    const prisma = new client_1.PrismaClient();
    const cachedMessages = yield redisClient.get(cacheKey);
    if (cachedMessages) {
        return res.status(200).json({ username: JSON.parse(cachedMessages) });
    }
    else {
        const usernames = yield prisma.user.findMany({
            select: {
                username: true,
            },
        });
        const username = usernames.filter((users) => users.username.toLowerCase().startsWith(user.toLowerCase()));
        yield redisClient.set(cacheKey, JSON.stringify(username), {
            EX: 3600, // Expire after 1 hour (3600 seconds)
        });
        res.json({
            username,
        });
    }
}));
