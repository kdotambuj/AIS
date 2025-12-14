import express from "express";
import cors from "cors";
import AuthRoutes from './routes/auth.route.js'

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());



// Check api
app.get('/health', (req, res)=>{
    res.send('API is running')
})

app.use('/api/v1/auth', AuthRoutes)

export default app;

