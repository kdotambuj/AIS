import express from "express";
import cors from "cors";
import AuthRoutes from "./routes/auth.route.js";
import AuthorityRoutes from "./routes/authority.route.js";
import ResourceRoutes from "./routes/resource.route.js";
import DepartmentRoutes from "./routes/department.route.js";
import TicketRoutes from "./routes/ticket.route.js";
import UserRoutes from "./routes/user.route.js";

import CookieParser from "cookie-parser";
const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(CookieParser());

// Check api
app.get("/health", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Backend Status</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f8;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
            background: white;
            padding: 30px 40px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          a {
            color: #0070f3;
            text-decoration: none;
            font-weight: bold;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Backend is running fine ✅</h2>
          <p>
            Access the functional website here:<br/>
            <a href="https://ais-ten.vercel.app/" target="_blank">
              https://ais-ten.vercel.app/
            </a>
          </p>
        </div>
      </body>
    </html>
  `);
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/authority", AuthorityRoutes);
app.use("/api/v1/resource", ResourceRoutes);
app.use("/api/v1/department", DepartmentRoutes);
app.use("/api/v1/ticket", TicketRoutes);
app.use("/api/v1/user", UserRoutes);

export default app;
