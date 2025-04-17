interface HeaderProps {
  activeTaskCount: number;
  totalTaskCount: number;
}

export default function Header({ activeTaskCount, totalTaskCount }: HeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">TODOアプリ</h1>
        <div className="flex gap-4">
          <span className="text-sm text-gray-500 bg-white py-1 px-3 rounded-full shadow-sm">
            タスク: <span>{activeTaskCount}</span>/<span>{totalTaskCount}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
