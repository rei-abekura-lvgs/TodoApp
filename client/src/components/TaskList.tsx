import { Task, Category } from "@/pages/Home";
import TaskItem from "./TaskItem";
import { ListChecks, Inbox } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  onTaskToggle: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskUpdated: () => void;
}

export default function TaskList({
  tasks,
  categories,
  isLoading,
  onTaskToggle,
  onTaskDelete,
  onTaskUpdated,
}: TaskListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <ListChecks className="mr-2 text-primary h-5 w-5" />
        タスク一覧
      </h2>

      {isLoading ? (
        <div className="py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-500">読み込み中...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <Inbox className="h-16 w-16 mx-auto mb-2 text-gray-300" />
          <p>タスクがありません</p>
          <p className="text-sm">新しいタスクを追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              categories={categories}
              onToggle={() => onTaskToggle(task.id)}
              onDelete={() => onTaskDelete(task.id)}
              onUpdate={onTaskUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
