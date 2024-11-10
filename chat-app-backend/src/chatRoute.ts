import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
export const chatRouter = express.Router();

chatRouter.post("/add", async (req, res) => {
  const { to, from, message } = req.body;
  try {
    const chat = await prisma.chat.create({
      data: {
        to,
        from,
        message,
        time: new Date(),
      },
    });
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error: "Failed to add chat message" });
  }
});

chatRouter.get("/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const messages = await prisma.chat.findMany({
      where: {
        OR: [{ to: username }, { from: username }],
      },
    });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});
chatRouter.post("/personal", async (req: any, res: any) => {
  const { username1, username2 } = req.body; // Using query params for GET requests

  if (!username1 || !username2) {
    return res
      .status(400)
      .json({ message: "Both username1 and username2 are required" });
  }

  try {
    const messages = await prisma.chat.findMany({
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
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      message: "An error occurred while fetching messages",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Ensure proper disconnection on server shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
