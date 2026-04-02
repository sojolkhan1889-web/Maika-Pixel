import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

// Import Routes
import trackRoutes from "./src/server/routes/track";
import adminRoutes from "./src/server/routes/admin";
import pixelRoutes from "./src/server/routes/pixels";
import eventRoutes from "./src/server/routes/events";
import orderRoutes from "./src/server/routes/orders";
import customerRoutes from "./src/server/routes/customers";
import incompleteOrderRoutes from "./src/server/routes/incompleteOrders";
import settingsRoutes from "./src/server/routes/settings";
import subscriptionRoutes from "./src/server/routes/subscriptions";

// Import Worker
import { startWorker } from "./src/server/worker";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // ==========================================
  // API ROUTES (Backend)
  // ==========================================
  
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "Maika Pixel Backend is running!",
      timestamp: new Date().toISOString()
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

  // Start Background Worker for processing CAPI events
  if (process.env.NODE_ENV !== "test") {
    startWorker();
  }

  // ==========================================
  // VITE FRONTEND MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Development mode: Use Vite's middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
