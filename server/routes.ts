import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTaskSchema, insertCategorySchema } from "@shared/schema";
import { taskController } from "./controllers/taskController.js";
import { categoryController } from "./controllers/categoryController.js";
import { errorHandler } from "./middleware/errorHandler.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to database if using MongoDB
  if (process.env.DATABASE_URL) {
    await import("./db.js");
  }

  // Task routes
  app.get("/api/tasks", taskController.getAllTasks);
  app.get("/api/tasks/:id", taskController.getTaskById);
  app.post("/api/tasks", taskController.createTask);
  app.put("/api/tasks/:id", taskController.updateTask);
  app.delete("/api/tasks/:id", taskController.deleteTask);
  app.get("/api/tasks/filter", taskController.getFilteredTasks);

  // Category routes
  app.get("/api/categories", categoryController.getAllCategories);
  app.post("/api/categories", categoryController.createCategory);
  app.delete("/api/categories/:id", categoryController.deleteCategory);

  // Error handling middleware
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
