import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { errorHandler } from './utils/errorHandler.js';

import userRouter from './routes/userRoute.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';

const app = express();
const port = process.env.PORT || 4000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const nodeEnv = process.env.NODE_ENV || 'development';

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is required');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required');
    process.exit(1);
}

if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/', (req, res) => {
    res.send('API Working!');
});

connectDB();

app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler);

app.listen(port, () => {
    if (nodeEnv === 'development') {
        console.log(`Server running on port ${port}`);
    }
});
