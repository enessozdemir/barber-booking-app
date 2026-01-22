import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/routes/auth.routes';
import barberRoutes from './modules/barber/routes/barber.routes';
import bookingRoutes from './modules/booking/routes/booking.routes';
import earningsRoutes from './modules/earnings/routes/earnings.routes';
import expensesRoutes from './modules/expenses/routes/expenses.routes';
import financialRoutes from './modules/financial/routes/financial.routes';
import dailyStatsRoutes from './modules/financial/daily-stats/daily-stats.routes';
import errorHandler from './middleware/errorHandler';
import { corsOptions } from './config/cors';

dotenv.config();

const app = express();

// Trust Proxy - Required for running behind a proxy (like Railway/Heroku/Nginx)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 1000 : 3000, // Increased limits
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(cookieParser());
app.use(express.json());

// Request Logging - Disabled for cleaner terminal output
// app.use(httpLogger);

app.use('/auth', authRoutes);
app.use('/barbers', barberRoutes);
app.use('/bookings', bookingRoutes);
app.use('/earnings', earningsRoutes);
app.use('/expenses', expensesRoutes);
app.use('/financial', financialRoutes);
app.use('/daily-stats', dailyStatsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

// Global Error Handler
app.use(errorHandler);

export default app;
