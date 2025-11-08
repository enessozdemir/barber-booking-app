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

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function registerUser({
  phone,
  email,
  full_name,
  password,
  role = "user",
}: {
  phone: string;
  email: string;
  full_name: string;
  password: string;
  role?: string;
}) {
  try {
    const { data: existingPhone } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (existingPhone) {
      throw new Error("Phone already registered");
    }

    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingEmail) {
      throw new Error("Email already registered");
    }
  } catch (err) {
    // continue
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
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  if (error || !user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password as string);
  if (!match) throw new Error("Invalid credentials");

  const payload = { id: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // store hashed refresh token in DB (token rotation / revocation support)
  await tokenService.saveRefreshToken(refreshToken, user.id);

  // don't return password
  // create shallow copy to avoid mutating supabase return
  const safeUser = { ...user } as any;
  delete safeUser.password;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  // verify token signature
  const payload = verifyRefreshToken(refreshToken);
  if (!payload || !payload.id) throw new Error("Invalid refresh token");
  // check token exists and is valid (not revoked / expired)
  const row = await tokenService.findValidRefreshToken(refreshToken);
  if (!row) throw new Error("Refresh token not found or revoked");

  // rotation: issue new refresh token and revoke old one
  const newRefresh = signRefreshToken({ id: payload.id, role: payload.role });
  const newAccess = signAccessToken({ id: payload.id, role: payload.role });

  await tokenService.rotateRefreshToken(refreshToken, newRefresh, payload.id);

  return { accessToken: newAccess, refreshToken: newRefresh };
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

  console.log('Sending reset email with:', process.env.GM_EMAIL);

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
      console.error('Failed to send reset email', err);
      // still return true to avoid leaking user existence; in dev you can check server logs for the link
    }
  } else {
    // Development fallback: log the link so developer can copy it
    console.info('[reset link]', link);
  }

  return true;
}

export async function verifyResetToken(id: string, token: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !user) throw new Error("User not found");

  const secret = JWT_SECRET + user.password;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    throw new Error("Invalid or expired token");
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
  if (error || !user) throw new Error("User not found");

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
    throw new Error("Invalid or expired token");
  }
}
