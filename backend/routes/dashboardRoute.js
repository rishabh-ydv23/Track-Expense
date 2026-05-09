import express from "express";
import { getDashboardOverview } from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/auth.js";

const dashboardRouter = express.Router();


dashboardRouter.get("/", authMiddleware, getDashboardOverview);
// Alias for clients that call /dashboard/overview
dashboardRouter.get("/overview", authMiddleware, getDashboardOverview);

export default dashboardRouter;