import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import CategoryManager from "@/components/CategoryManager";
import TaskFilter from "@/components/TaskFilter";
import TaskList from "@/components/TaskList";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: number;
  dueDate?: Date | null;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function Home() {
  const { toast } = useToast();
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  
  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Fetch tasks
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useQuery<{ success: boolean; data: Task[] }>({
    queryKey: ["/api/tasks"],
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["/api/categories"],
  });

  const tasks = tasksData?.data || [];
  const categories = categoriesData?.data || [];

  // Filter tasks
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (statusFilter === "active") {
      filtered = filtered.filter((task) => !task.completed);
    } else if (statusFilter === "completed") {
      filtered = filtered.filter((task) => task.completed);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }

    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter(
        (task) => task.priority === parseInt(priorityFilter)
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Task toggle mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) throw new Error("Task not found");

      return apiRequest("PUT", `/api/tasks/${taskId}`, {
        completed: !taskToUpdate.completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "タスクを更新しました",
        description: "タスクのステータスが変更されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "タスクを削除しました",
        description: "タスクが正常に削除されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "カテゴリを削除しました",
        description: "カテゴリが正常に削除されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler for task toggling
  const handleTaskToggle = (taskId: string) => {
    toggleTaskMutation.mutate(taskId);
  };

  // Handler for task deletion
  const handleTaskDelete = (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "タスクの削除",
      message: "本当にこのタスクを削除しますか？",
      onConfirm: () => {
        deleteTaskMutation.mutate(taskId);
      },
    });
  };

  // Handler for category deletion
  const handleCategoryDelete = (categoryId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "カテゴリの削除",
      message: "本当にこのカテゴリを削除しますか？",
      onConfirm: () => {
        deleteCategoryMutation.mutate(categoryId);
      },
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  // Count active and total tasks
  const activeTaskCount = tasks.filter((task) => !task.completed).length;
  const totalTaskCount = tasks.length;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-4">
        <Header activeTaskCount={activeTaskCount} totalTaskCount={totalTaskCount} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Form & Category Manager */}
          <div className="lg:col-span-1 space-y-6">
            <TaskForm
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              onTaskAdded={() => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] })}
            />

            <CategoryManager
              categories={categories}
              isLoading={isLoadingCategories}
              onCategoryAdded={() => queryClient.invalidateQueries({ queryKey: ["/api/categories"] })}
              onCategoryDeleted={handleCategoryDelete}
            />
          </div>

          {/* Right Column - Task Filters & List */}
          <div className="lg:col-span-2 space-y-6">
            <TaskFilter
              categories={categories}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              priorityFilter={priorityFilter}
              onStatusFilterChange={setStatusFilter}
              onCategoryFilterChange={setCategoryFilter}
              onPriorityFilterChange={setPriorityFilter}
            />

            <TaskList
              tasks={filteredTasks}
              categories={categories}
              isLoading={isLoadingTasks}
              onTaskToggle={handleTaskToggle}
              onTaskDelete={handleTaskDelete}
              onTaskUpdated={() => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] })}
            />
          </div>
        </div>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmDialog}
        />
      </div>
    </div>
  );
}
