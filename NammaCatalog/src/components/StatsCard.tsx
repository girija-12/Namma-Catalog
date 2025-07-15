interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "red" | "purple";
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
