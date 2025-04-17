import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Priority-related utility functions
export function getPriorityBgColor(priority: number): string {
  switch (priority) {
    case 1:
      return "#fee2e2"; // red-100 - high priority
    case 2:
      return "#fef3c7"; // yellow-100 - medium priority
    case 3:
      return "#d1fae5"; // green-100 - low priority
    default:
      return "#f3f4f6"; // gray-100 - default
  }
}

export function getPriorityText(priority: number): string {
  switch (priority) {
    case 1:
      return "高";
    case 2:
      return "中";
    case 3:
      return "低";
    default:
      return "中";
  }
}

export function getPriorityTextColor(priority: number): string {
  switch (priority) {
    case 1:
      return "bg-red-100 text-red-800";
    case 2:
      return "bg-yellow-100 text-yellow-800";
    case 3:
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Format date for API
export function formatDateForApi(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

// Format date for display
export function formatDateForDisplay(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
