import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { LoginInput, SignupInput } from "../schema/auth.schema.js";
import { env } from "../config/env.js";


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
        department: data.department, 
        password: hashed,
        role:data.role
      },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        createdAt: true,
        role:true
      },
    });

    return user;
};

export const LoginService = async(data:LoginInput)=>{

    const user = await prisma.user.findUnique({where:{email:data.email}});
    if (!user) throw new Error('User not found')

    const valid = bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error('Password does not match ');

    if (user.role !== data.role) throw new Error('Role mismatched');

    const token = jwt.sign(
      {
        userId : user.id,
        role:user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d'}
    )

    const {password, ...safeUser} = user;

    return {
      user:safeUser,
      token
    }
}
