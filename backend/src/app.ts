import express from "express";
import cors from "cors";
import AuthRoutes from './routes/auth.route.js'
import AuthorityRoutes from './routes/authority.route.js'
import ResourceRoutes from './routes/resource.route.js'
import DepartmentRoutes from './routes/department.route.js'
import TicketRoutes from './routes/ticket.route.js'

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

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/authority', AuthorityRoutes)
app.use('/api/v1/resource', ResourceRoutes)
app.use('/api/v1/department',DepartmentRoutes)
app.use('/api/v1/ticket', TicketRoutes)

export default app;

