import { Response, Request } from "express";
import { SignupService } from "../services/auth.service.js";
import { UserSignupSchema } from "../schema/UserSignup.schema.js";
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
