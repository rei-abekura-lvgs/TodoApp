import { storage } from "../storage.js";
import { insertTaskSchema } from "@shared/schema";

export const taskController = {
  // Get all tasks
  getAllTasks: async (req, res, next) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  // Get a specific task by ID
  getTaskById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const task = await storage.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: "タスクが見つかりません",
          status: 404
        });
      }
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  // Create a new task
  createTask: async (req, res, next) => {
    try {
      // Validate request body
      const parsedData = insertTaskSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          error: "入力データが不正です",
          details: parsedData.error.format(),
          status: 400
        });
      }
      
      // Create task
      const task = await storage.createTask(parsedData.data);
      
      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a task
  updateTask: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Partial validation for update
      const partialTaskSchema = insertTaskSchema.partial();
      const parsedData = partialTaskSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          error: "入力データが不正です",
          details: parsedData.error.format(),
          status: 400
        });
      }
      
      // Update task
      const updatedTask = await storage.updateTask(id, parsedData.data);
      
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          error: "タスクが見つかりません",
          status: 404
        });
      }
      
      res.json({
        success: true,
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a task
  deleteTask: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "タスクが見つかりません",
          status: 404
        });
      }
      
      res.json({
        success: true,
        message: "タスクを削除しました"
      });
    } catch (error) {
      next(error);
    }
  },

  // Get filtered tasks
  getFilteredTasks: async (req, res, next) => {
    try {
      const { completed, category, priority } = req.query;
      
      // Convert query params to appropriate types
      const completedFilter = completed !== undefined 
        ? completed === 'true' 
        : undefined;
      
      const priorityFilter = priority 
        ? parseInt(priority) 
        : undefined;
      
      const tasks = await storage.getFilteredTasks(
        completedFilter, 
        category, 
        priorityFilter
      );
      
      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }
};
