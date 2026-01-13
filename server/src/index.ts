/// <reference path="./types/express-session.d.ts" />
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import propertiesRoutes from './routes/properties';
import dealsRoutes from './routes/deals';
import communicationRoutes from './routes/communication';
import contractsRoutes from './routes/contracts';
import analyticsRoutes from './routes/analytics';
import timesheetsRoutes from './routes/timesheets';
import paymentsRoutes from './routes/payments';
import systemRoutes from './routes/system';
import marketingRoutes from './routes/marketing';
import buyersRoutes from './routes/buyers';
import teamsRoutes from './routes/teams';
import propertyLookupRoutes from './routes/property-lookup';
import searchRoutes from './routes/search';
import { pool } from './db';

import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust the first proxy (Vercel, Heroku, etc.)
app.set('trust proxy', 1);

const PgSession = connectPgSimple(session);

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Move to nonces for production
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://*.vercel.app", "https://*.poof.io", "https://api.stripe.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://checkout.stripe.com"],
            upgradeInsecureRequests: [],
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' }
}));

app.use(morgan('dev'));
app.use('/api/', apiLimiter);
app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost and Vercel deployments
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5000',
            'http://localhost:3000',
            'https://www.dealexpress.io',
            'https://dealexpress.io',
            process.env.VITE_API_URL // Your production URL if set
        ];

        // Also allow any Vercel preview URLs and Replit domains
        if (origin.endsWith('.vercel.app') || origin.endsWith('.replit.dev') || origin.endsWith('.replit.app') || origin.endsWith('.repl.co') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
}

// Session middleware
const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset cookie expiration on every response
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax'
    }
};
if (pool) {
    sessionOptions.store = new PgSession({ pool, tableName: 'session' });
}
app.use(session(sessionOptions));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/timesheets', timesheetsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/buyers', buyersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/property-lookup', propertyLookupRoutes);
app.use('/api/search', searchRoutes);

app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

export default app;
