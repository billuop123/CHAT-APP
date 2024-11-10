import { PrismaClient } from "@prisma/client";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const userRouter = express.Router();
const userSchema = z.object({
  username: z.string(),
  password: z.string(),
});
userRouter.post("/signup", async (req: any, res: any) => {
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
  const prisma = new PrismaClient();
  const oldUser = await prisma.user.findFirst({
    where: {
      username,
    },
  });
  if (oldUser) {
    return res.json({
      error: "User already exists",
    });
  }
  const token = jwt.sign({ username }, "jwtsecret", {
    expiresIn: 5 * 24 * 60 * 60 * 1000,
  });
  // res.cookie("jwt", token, {
  //   expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  // });
  try {
    const newUser = await prisma.user.create({
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
  } catch (err) {
    return res
      .status(500)
      .json({ error: "There was an error creating the user" });
  }
});
// Initialize PrismaClient once at the top of the file

// Route handler
userRouter.get("/all", async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const allUsers = await prisma.user.findMany({});
    res.status(200).json({
      allUsers,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

userRouter.post("/signin", async (req: any, res: any) => {
  const prisma = new PrismaClient();
  const { username, password } = req.body;
  const user = await prisma.user.findFirst({
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
  const token = jwt.sign({ username }, "jwtsecret", {
    expiresIn: 5 * 24 * 60 * 60 * 1000,
  });
  // res.cookie("jwt", token, {
  //   expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  // });
  return res.status(200).json({
    msg: "successfully logged in ",
    token,
  });
});
userRouter.get("/user-info/:username", async (req: any, res: any) => {
  const { username } = req.params;
  console.log(username);
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  return res.json({
    user,
  });
});
