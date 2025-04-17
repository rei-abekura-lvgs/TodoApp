import { Category } from "@/pages/Home";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface TaskFilterProps {
  categories: Category[];
  statusFilter: string;
  categoryFilter: string;
  priorityFilter: string;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
}

export default function TaskFilter({
  categories,
  statusFilter,
  categoryFilter,
  priorityFilter,
  onStatusFilterChange,
  onCategoryFilterChange,
  onPriorityFilterChange,
}: TaskFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <Filter className="mr-2 text-primary h-5 w-5" />
        フィルター
      </h2>

      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-auto">
          <Label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            状態
          </Label>
          <Select
            value={statusFilter}
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger id="statusFilter" className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <SelectValue placeholder="状態を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="active">未完了</SelectItem>
              <SelectItem value="completed">完了済み</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto">
          <Label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </Label>
          <Select
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
          >
            <SelectTrigger id="categoryFilter" className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリ</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto">
          <Label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">
            優先度
          </Label>
          <Select
            value={priorityFilter}
            onValueChange={onPriorityFilterChange}
          >
            <SelectTrigger id="priorityFilter" className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <SelectValue placeholder="優先度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての優先度</SelectItem>
              <SelectItem value="1">高</SelectItem>
              <SelectItem value="2">中</SelectItem>
              <SelectItem value="3">低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
