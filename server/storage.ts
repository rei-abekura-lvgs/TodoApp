import { tasks, type Task, type InsertTask, categories, type Category, type InsertCategory, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

// Interface for all storage operations needed by the TODO app
export interface IStorage {
  // User operations (from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getFilteredTasks(completed?: boolean, category?: string, priority?: number): Promise<Task[]>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
}

// In-memory storage implementation (for development/testing)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<string, Task>;
  private categories: Map<string, Category>;
  currentUserId: number;
  currentTaskId: number;
  currentCategoryId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.categories = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentCategoryId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = { 
      title: insertTask.title,
      completed: insertTask.completed ?? false,
      priority: insertTask.priority ?? 2,
      dueDate: insertTask.dueDate ?? null,
      category: insertTask.category ?? null,
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.tasks.set(String(id), task);
    return task;
  }

  async updateTask(id: string, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    // 明示的に型を付与して更新
    const updatedTask: Task = {
      ...task,
      title: taskUpdate.title !== undefined ? taskUpdate.title : task.title,
      completed: taskUpdate.completed !== undefined ? taskUpdate.completed : task.completed,
      priority: taskUpdate.priority !== undefined ? taskUpdate.priority : task.priority,
      dueDate: taskUpdate.dueDate !== undefined ? taskUpdate.dueDate : task.dueDate,
      category: taskUpdate.category !== undefined ? taskUpdate.category : task.category,
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getFilteredTasks(completed?: boolean, category?: string, priority?: number): Promise<Task[]> {
    let filteredTasks = Array.from(this.tasks.values());
    
    if (completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === completed);
    }
    
    if (category) {
      filteredTasks = filteredTasks.filter(task => task.category === category);
    }
    
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    return filteredTasks;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const now = new Date();
    const category: Category = {
      name: insertCategory.name,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.categories.set(String(id), category);
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }
}

// PostgreSQL database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const taskId = parseInt(id);
    if (isNaN(taskId)) return undefined;

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));
    
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    
    return task;
  }

  async updateTask(id: string, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const taskId = parseInt(id);
    if (isNaN(taskId)) return undefined;
    
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...taskUpdate,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, taskId))
      .returning();
    
    return updatedTask || undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    const taskId = parseInt(id);
    if (isNaN(taskId)) return false;
    
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning({ id: tasks.id });
    
    return result.length > 0;
  }

  async getFilteredTasks(completed?: boolean, category?: string, priority?: number): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    const conditions = [];
    
    if (completed !== undefined) {
      conditions.push(eq(tasks.completed, completed));
    }
    
    if (category && category.trim() !== '') {
      conditions.push(eq(tasks.category, category));
    }
    
    if (priority) {
      conditions.push(eq(tasks.priority, priority));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(tasks.createdAt));
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) return false;
    
    const result = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning({ id: categories.id });
    
    return result.length > 0;
  }
}

// Use PostgreSQL database since DATABASE_URL exists
export const storage = new DatabaseStorage();
