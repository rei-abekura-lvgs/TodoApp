import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Trash2 } from "lucide-react";
import { Category } from "@/pages/Home";

interface CategoryManagerProps {
  categories: Category[];
  isLoading: boolean;
  onCategoryAdded: () => void;
  onCategoryDeleted: (categoryId: string) => void;
}

export default function CategoryManager({
  categories,
  isLoading,
  onCategoryAdded,
  onCategoryDeleted,
}: CategoryManagerProps) {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState("");

  // Category creation mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/categories", { name });
    },
    onSuccess: () => {
      setNewCategory("");
      onCategoryAdded();
      toast({
        title: "カテゴリを追加しました",
        description: "新しいカテゴリが正常に追加されました",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      createCategoryMutation.mutate(newCategory.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Tag className="mr-2 text-primary h-5 w-5" />
        カテゴリ管理
      </h2>

      <form onSubmit={handleSubmit} className="mb-4 flex">
        <Input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="新しいカテゴリ"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={createCategoryMutation.isPending}
          required
        />
        <Button
          type="submit"
          className="px-4 py-2 bg-secondary hover:bg-green-700 text-white font-medium rounded-r-md shadow transition-colors"
          disabled={createCategoryMutation.isPending}
        >
          {createCategoryMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </form>

      {isLoading ? (
        <div className="py-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-center text-gray-500 py-2">カテゴリがありません</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
              >
                <span className="font-medium">{category.name}</span>
                <button
                  onClick={() => onCategoryDeleted(category.id)}
                  className="text-gray-400 hover:text-warning transition-colors"
                  aria-label={`Delete ${category.name} category`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
