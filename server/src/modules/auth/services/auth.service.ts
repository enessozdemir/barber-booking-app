import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../../../config/supabase";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import * as tokenService from "./token.service";
import { AppError } from "../utils/AppError";
import { AUTH_ERRORS } from "../constants/errorCodes";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET as string;
export async function registerUser({
  phone,
  email,
  full_name,
  password,
  confirm_password,
  role = "user",
}: {
  phone: string;
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
  role?: string;
}) {
  try {
    if (!phone || !email || !full_name || !password || !confirm_password) {
      throw new AppError(AUTH_ERRORS.MISSING_FIELDS, "Missing fields", 400);
    }

    if (password !== confirm_password) {
      throw new AppError(AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH, "Passwords do not match", 400);
    }

    const { data: existingPhone } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (existingPhone) {
      throw new AppError(AUTH_ERRORS.PHONE_ALREADY_REGISTERED, "Phone already registered", 400);
    }

    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingEmail) {
      throw new AppError(AUTH_ERRORS.EMAIL_ALREADY_REGISTERED, "Email already registered", 400);
    }
  } catch (err) {
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const { data, error } = await supabase
    .from("users")
    .insert({ phone, email, password: hashed, full_name, role })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function loginUser({
  phone,
  password,
}: {
  phone: string;
  password: string;
}) {
  try {
    if (!phone || !password) {
      throw new AppError(AUTH_ERRORS.MISSING_PHONE_OR_PASSWORD, "Missing phone or password", 400);
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();
    if (error || !user) {
      throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, "Invalid credentials", 401);
    }

    const match = await bcrypt.compare(password, user.password as string);
    if (!match) {
      throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, "Invalid credentials", 401);
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    //save refresh token to db
    await tokenService.saveRefreshToken(refreshToken, user.id);

    const safeUser = { ...user } as any;
    delete safeUser.password;
    return { user: safeUser, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  // verify token signature
  const payload = verifyRefreshToken(refreshToken);

  if (!payload || !payload.id) {
    throw new AppError(AUTH_ERRORS.INVALID_REFRESH_TOKEN, "Invalid refresh token", 401);
  }
  // check token exists and is valid (not revoked / expired)
  const row = await tokenService.findValidRefreshToken(refreshToken);

  if (!row) {
    throw new AppError(AUTH_ERRORS.REFRESH_TOKEN_NOT_FOUND, "Refresh token not found or revoked", 401);
  }

  // fetch user data to return to client
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", payload.id)
    .maybeSingle();

  if (error || !user) throw new Error("User not found");

  // rotation: issue new refresh token and revoke old one
  const newRefresh = signRefreshToken({ id: payload.id, role: payload.role });
  const newAccess = signAccessToken({ id: payload.id, role: payload.role });

  await tokenService.rotateRefreshToken(refreshToken, newRefresh, payload.id);

  // remove password from user object
  const safeUser = { ...user } as any;
  delete safeUser.password;

  return { accessToken: newAccess, refreshToken: newRefresh, user: safeUser };
}

export async function logout(refreshToken: string) {
  // revoke the provided refresh token
  await tokenService.revokeRefreshTokenByRaw(refreshToken);
  return true;
}

export async function forgotPassword(phone: string, email: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .eq("email", email)
    .maybeSingle();

  if (error || !user) throw new Error("User not found");

  const secret = JWT_SECRET + user.password;
  const token = jwt.sign({ id: user.id, email: user.email }, secret, {
    expiresIn: "15m",
  });

  const link = `${process.env.CLIENT_URL}/reset-password/${user.id}/${token}`;

  console.log("Sending reset email with:", process.env.GM_EMAIL);

  const gmEmail = process.env.GM_EMAIL;
  const gmPass = process.env.GM_PASSWORD;
  if (gmEmail && gmPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmEmail, pass: gmPass },
    });

    try {
      await transporter.sendMail({
        from: gmEmail,
        to: email,
        subject: "Şifre Sıfırlama",
        text: `Şifreni sıfırlamak için bu linke tıkla: ${link}`,
      });
    } catch (err) {
      console.error("Failed to send reset email", err);
      // still return true to avoid leaking user existence; in dev you can check server logs for the link
    }
  } else {
    // Development fallback: log the link so developer can copy it
    console.info("[reset link]", link);
  }

  return true;
}

export async function verifyResetToken(id: string, token: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, "User not found", 404);
  }

  const secret = JWT_SECRET + user.password;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    throw new AppError(AUTH_ERRORS.INVALID_OR_EXPIRED_TOKEN, "Invalid or expired token", 400);
  }
}

export async function resetPassword(
  id: string,
  token: string,
  newPassword: string
) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, "User not found", 404);
  }

  const secret = JWT_SECRET + user.password;

  try {
    jwt.verify(token, secret);
    const hashed = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashed })
      .eq("id", id);
    if (updateError) throw updateError;
    return true;
  } catch {
    throw new AppError(AUTH_ERRORS.INVALID_OR_EXPIRED_TOKEN, "Invalid or expired token", 400);
  }
}
