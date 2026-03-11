import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { LoginInput, SignupInput } from "../schema/auth.schema.js";
import { env } from "../config/env.js";

export const SignupService = async (data: SignupInput) => {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      departmentId: data.departmentId,
      password: hashed,
      role: data.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      departmentId: true,
      createdAt: true,
      role: true,
    },
  });

  return user;
};

export const LoginService = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new Error("Password does not match ");

  if (user.role !== data.role) throw new Error("Role mismatched");

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const { password, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};

export const GetMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  if (!user) throw new Error("User not found");

  return user;
};
