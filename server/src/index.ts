import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import propertiesRoutes from './routes/properties';
import communicationRoutes from './routes/communication';
import contractsRoutes from './routes/contracts';
import analyticsRoutes from './routes/analytics';
import timesheetsRoutes from './routes/timesheets';
import systemRoutes from './routes/system';
import marketingRoutes from './routes/marketing';
import { pool } from './db';

import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const PgSession = connectPgSimple(session);

app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development ease, enable and configure in production
}));
app.use(morgan('dev'));
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost and Vercel deployments
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.VITE_API_URL // Your production URL if set
        ];
        
        // Also allow any Vercel preview URLs
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
}

// Session middleware
app.use(session({
    store: new PgSession({
        pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax' // Use 'lax' for single-domain monorepo
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/timesheets', timesheetsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/marketing', marketingRoutes);

app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

export default app;
