import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save } from "lucide-react";
import { Category } from "@/pages/Home";

// Define the form schema
const taskFormSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です" }),
  priority: z.enum(["1", "2", "3"], {
    required_error: "優先度を選択してください",
  }),
  dueDate: z.string().optional(),
  category: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  categories: Category[];
  isLoadingCategories: boolean;
  onTaskAdded: () => void;
}

export default function TaskForm({ categories, isLoadingCategories, onTaskAdded }: TaskFormProps) {
  const { toast } = useToast();
  
  // Initialize the form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      priority: "2",
      dueDate: "",
      category: "",
    },
  });

  // Task creation mutation
  const createTaskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      return apiRequest("POST", "/api/tasks", {
        title: values.title,
        priority: parseInt(values.priority),
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        category: values.category === "none" ? null : values.category,
        completed: false,
      });
    },
    onSuccess: () => {
      form.reset();
      onTaskAdded();
      toast({
        title: "タスクを追加しました",
        description: "新しいタスクが正常に追加されました",
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

  const onSubmit = (values: TaskFormValues) => {
    createTaskMutation.mutate(values);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <PlusCircle className="mr-2 text-primary h-5 w-5" />
        新しいタスク
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">タイトル*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="タスクのタイトルを入力"
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">優先度</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">期限</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">カテゴリ</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full py-2 px-4 bg-primary hover:bg-blue-700 text-white font-medium rounded-md shadow flex items-center justify-center transition-colors"
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            保存
          </Button>
        </form>
      </Form>
    </div>
  );
}
