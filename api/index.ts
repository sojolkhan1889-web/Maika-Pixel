import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import trackRoutes from "../src/server/routes/track";
import adminRoutes from "../src/server/routes/admin";
import pixelRoutes from "../src/server/routes/pixels";
import eventRoutes from "../src/server/routes/events";
import orderRoutes from "../src/server/routes/orders";
import customerRoutes from "../src/server/routes/customers";
import incompleteOrderRoutes from "../src/server/routes/incompleteOrders";
import settingsRoutes from "../src/server/routes/settings";
import subscriptionRoutes from "../src/server/routes/subscriptions";

dotenv.config();

const app = express();

// CORS — allow all origins so seller websites can send events
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Maika Pixel Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use("/api/track", trackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pixels", pixelRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/incomplete-orders", incompleteOrderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

export default app;
