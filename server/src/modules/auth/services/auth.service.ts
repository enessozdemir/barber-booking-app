import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import * as tokenService from "./token.service";
import { AppError } from "../utils/AppError";
import { AUTH_ERRORS } from "../constants/errorCodes";
import authRepository from "../repositories/auth.repository";
import logger from "../../../utils/logger";

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
  if (!phone || !email || !full_name || !password || !confirm_password) {
    throw new AppError(AUTH_ERRORS.MISSING_FIELDS, "Missing fields", 400);
  }

  if (password !== confirm_password) {
    throw new AppError(AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH, "Passwords do not match", 400);
  }

  const existingPhone = await authRepository.findUserByPhone(phone);
  if (existingPhone) {
    throw new AppError(AUTH_ERRORS.PHONE_ALREADY_REGISTERED, "Phone already registered", 400);
  }

  const existingEmail = await authRepository.findUserByEmail(email);
  if (existingEmail) {
    throw new AppError(AUTH_ERRORS.EMAIL_ALREADY_REGISTERED, "Email already registered", 400);
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await authRepository.createUser({ phone, email, password: hashed, full_name, role });
  return newUser;
}

export async function loginUser({
  phone,
  password,
}: {
  phone: string;
  password: string;
}) {
  if (!phone || !password) {
    throw new AppError(AUTH_ERRORS.MISSING_PHONE_OR_PASSWORD, "Missing phone or password", 400);
  }

  const user = await authRepository.findUserByPhone(phone);
  if (!user) {
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
  const user = await authRepository.findUserById(payload.id);

  if (!user) throw new Error("User not found");

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
  const user = await authRepository.findUserByPhone(phone);

  // Check if email matches
  if (!user || user.email !== email) throw new Error("User not found");

  const secret = JWT_SECRET + user.password;
  const token = jwt.sign({ id: user.id, email: user.email }, secret, {
    expiresIn: "15m",
  });

  const link = `${process.env.CLIENT_URL}/reset-password/${user.id}/${token}`;

  logger.info(`Sending reset email with: ${process.env.GM_EMAIL}`);

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
      logger.error(`Failed to send reset email: ${err}`);
      // still return true to avoid leaking user existence; in dev you can check server logs for the link
    }
  } else {
    // Development fallback: log the link so developer can copy it
    logger.info(`[reset link] ${link}`);
  }

  return true;
}

export async function verifyResetToken(id: string, token: string) {
  const user = await authRepository.findUserById(id);
  if (!user) {
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
  const user = await authRepository.findUserById(id);
  if (!user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, "User not found", 404);
  }

  const secret = JWT_SECRET + user.password;

  try {
    jwt.verify(token, secret);
    const hashed = await bcrypt.hash(newPassword, 10);
    await authRepository.updateUserPassword(id, hashed);
    return true;
  } catch {
    throw new AppError(AUTH_ERRORS.INVALID_OR_EXPIRED_TOKEN, "Invalid or expired token", 400);
  }
}

export async function updateUserProfile(userId: string, data: { full_name?: string; email?: string; phone?: string }) {
  // Validate input
  if (!data.full_name && !data.email && !data.phone) {
    throw new AppError("INVALID_INPUT", "En az bir alan güncellenmelidir", 400);
  }

  // Check if email is being updated and if it's already taken
  if (data.email) {
    const existingUser = await authRepository.findUserByEmailExcludingId(data.email, userId);

    if (existingUser) {
      throw new AppError("EMAIL_EXISTS", "Bu e-posta adresi zaten kullanılıyor", 400);
    }
  }

  // Check if phone is being updated and if it's already taken
  if (data.phone) {
    const existingUser = await authRepository.findUserByPhoneExcludingId(data.phone, userId);

    if (existingUser) {
      throw new AppError("PHONE_EXISTS", "Bu telefon numarası zaten kullanılıyor", 400);
    }
  }

  // Update user
  const updateData: any = {};
  if (data.full_name) updateData.full_name = data.full_name;
  if (data.email) updateData.email = data.email;
  if (data.phone) updateData.phone = data.phone;

  const updatedUser = await authRepository.updateUser(userId, updateData);

  return updatedUser;
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  // Validate input
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new AppError("MISSING_FIELDS", "Tüm alanlar doldurulmalıdır", 400);
  }

  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    throw new AppError("PASSWORDS_DO_NOT_MATCH", "Yeni şifreler eşleşmiyor", 400);
  }

  // Get user from database
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, "Kullanıcı bulunamadı", 404);
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password as string);
  if (!isPasswordValid) {
    throw new AppError("INVALID_OLD_PASSWORD", "Eski şifre hatalı", 401);
  }

  // Check if new password is same as old password
  const isSameAsOld = await bcrypt.compare(newPassword, user.password as string);
  if (isSameAsOld) {
    throw new AppError("SAME_AS_OLD_PASSWORD", "Yeni şifre eski şifre ile aynı olamaz", 400);
  }

  // Check for sequential numbers (123456, 654321, etc.)
  const hasSequentialNumbers = (password: string): boolean => {
    // Check for ascending sequences (123, 234, 345, etc.)
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      // Check if three consecutive characters are sequential numbers
      if (
        char1 >= 48 && char1 <= 57 && // is digit
        char2 === char1 + 1 &&
        char3 === char2 + 1
      ) {
        return true;
      }

      // Check for descending sequences (321, 432, 543, etc.)
      if (
        char1 >= 48 && char1 <= 57 && // is digit
        char2 === char1 - 1 &&
        char3 === char2 - 1
      ) {
        return true;
      }
    }
    return false;
  };

  if (hasSequentialNumbers(newPassword)) {
    throw new AppError("WEAK_PASSWORD", "Şifre ardışık sayılar içeremez", 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password in database
  await authRepository.updateUserPassword(userId, hashedPassword);

  return true;
}
