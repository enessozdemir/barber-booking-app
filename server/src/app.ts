import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/routes/auth.routes';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

export default app;
