import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";

interface JwtPayload {
  userId: string;
  role: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = {
      userId: decoded.userId as string,
      role: decoded.role as Role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
