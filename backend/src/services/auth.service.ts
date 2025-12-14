import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { SignupInput } from "../schema/UserSignup.schema.js";


export const SignupService = async (
  data:SignupInput
) => {
  
    const exists = await prisma.user.findUnique({where:{email:data.email}});
    if (exists) throw new Error("Email already registered");

    const hashed  = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        rollNumber: data.rollNumber,
        enrollmentNumber: data.enrollmentNumber,
        department: data.department, 
        password: hashed,
        role:data.role
      },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        enrollmentNumber: true,
        department: true,
        createdAt: true,
      },
    });

    return user;
};
