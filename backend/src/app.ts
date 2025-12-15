import express from "express";
import cors from "cors";
import AuthRoutes from './routes/auth.route.js'
import CookieParser from 'cookie-parser'
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(CookieParser())



// Check api
app.get('/health', (req, res)=>{
    res.send('API is running')
})

app.use('/api/v1/auth', AuthRoutes)

export default app;

