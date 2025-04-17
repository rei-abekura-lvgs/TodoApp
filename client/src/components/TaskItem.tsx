import { useState } from "react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task, Category } from "@/pages/Home";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getPriorityBgColor, getPriorityText, getPriorityTextColor } from "@/lib/utils";
import { Check, Edit, Trash2, Calendar, Tag, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface TaskItemProps {
  task: Task;
  categories: Category[];
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

// Task edit form schema
const taskEditSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です" }),
  priority: z.enum(["1", "2", "3"], {
    required_error: "優先度を選択してください",
  }),
  dueDate: z.string().optional(),
  category: z.string().optional(),
});

type TaskEditValues = z.infer<typeof taskEditSchema>;

export default function TaskItem({ task, categories, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Format the due date for display
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "yyyy/MM/dd")
    : null;

  // Initialize the form for editing
  const form = useForm<TaskEditValues>({
    resolver: zodResolver(taskEditSchema),
    defaultValues: {
      title: task.title,
      priority: String(task.priority) as "1" | "2" | "3",
      dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
      category: task.category || "none",
    },
  });

  // Task update mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (values: TaskEditValues) => {
      return apiRequest("PUT", `/api/tasks/${task.id}`, {
        title: values.title,
        priority: parseInt(values.priority),
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        category: values.category === "none" ? null : values.category,
      });
    },
    onSuccess: () => {
      setIsEditing(false);
      onUpdate();
      toast({
        title: "タスクを更新しました",
        description: "タスクが正常に更新されました",
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

  const onSubmit = (values: TaskEditValues) => {
    updateTaskMutation.mutate(values);
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <div
      className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md"
      data-task-id={task.id}
      data-task-completed={task.completed ? "true" : "false"}
    >
      {/* Task Display */}
      {!isEditing && (
        <div
          className="flex items-start p-3"
          style={{ backgroundColor: getPriorityBgColor(task.priority) }}
        >
          <button
            className={`flex-shrink-0 mt-1 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center ${
              task.completed ? "bg-primary" : ""
            }`}
            onClick={onToggle}
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.completed && <Check className="h-3 w-3 text-white" />}
          </button>

          <div className="ml-3 flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className={`text-base font-semibold break-words ${
                    task.completed ? "text-gray-500 line-through" : "text-gray-900"
                  }`}
                >
                  {task.title}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {task.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      <Tag className="mr-1 h-3 w-3" />
                      {task.category}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityTextColor(
                      task.priority
                    )}`}
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {getPriorityText(task.priority)}
                  </span>
                  {formattedDueDate && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formattedDueDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex ml-2">
                <button
                  className="text-gray-400 hover:text-primary mx-1"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit task"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="text-gray-400 hover:text-warning mx-1"
                  onClick={onDelete}
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Editor */}
      {isEditing && (
        <div className="p-3 border-t border-gray-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="タスクのタイトル"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                            <SelectValue placeholder="優先度を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">高</SelectItem>
                          <SelectItem value="2">中</SelectItem>
                          <SelectItem value="3">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">カテゴリなし</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                  className="px-3 py-1 bg-primary hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
                >
                  {updateTaskMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                  ) : null}
                  更新
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
