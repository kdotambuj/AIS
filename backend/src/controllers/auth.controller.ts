import { Response, Request } from "express";
import { SignupService, LoginService } from "../services/auth.service.js";
import { UserLoginSchema, UserSignupSchema } from "../schema/auth.schema.js";
import { ZodError } from "zod";

export const SignupController = async (req: Request, res: Response) => {
  try {
    const data = UserSignupSchema.parse(req.body);
    const user = await SignupService(data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: err.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
};

export const LoginController = async (req: Request, res: Response) => {
  try {
    const data = UserLoginSchema.parse(req.body);
    const user = await LoginService(data);

    return res
      .cookie("token", user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 5 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully.",
        data: user.user,
      });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: err.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
};
