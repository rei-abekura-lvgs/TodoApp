import { storage } from "../storage.js";
import { insertCategorySchema } from "@shared/schema";

export const categoryController = {
  // Get all categories
  getAllCategories: async (req, res, next) => {
    try {
      const categories = await storage.getAllCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  },

  // Create a new category
  createCategory: async (req, res, next) => {
    try {
      // Validate request body
      const parsedData = insertCategorySchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          error: "入力データが不正です",
          details: parsedData.error.format(),
          status: 400
        });
      }
      
      // Check if category already exists
      const existingCategories = await storage.getAllCategories();
      const categoryExists = existingCategories.some(
        c => c.name.toLowerCase() === parsedData.data.name.toLowerCase()
      );
      
      if (categoryExists) {
        return res.status(409).json({
          success: false,
          error: "同じ名前のカテゴリが既に存在します",
          status: 409
        });
      }
      
      // Create category
      const category = await storage.createCategory(parsedData.data);
      
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a category
  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "カテゴリが見つかりません",
          status: 404
        });
      }
      
      res.json({
        success: true,
        message: "カテゴリを削除しました"
      });
    } catch (error) {
      next(error);
    }
  }
};
