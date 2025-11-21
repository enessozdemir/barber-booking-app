import { CorsOptions } from 'cors';

const isDevelopment = process.env.NODE_ENV !== 'production';

const whitelist = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174', // Vite alternative port
    process.env.CLIENT_ORIGIN
].filter(Boolean);

export const corsOptions: CorsOptions = {
    origin: isDevelopment
        ? true // Allow all origins in development
        : (origin, callback) => {
            if (!origin || whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
