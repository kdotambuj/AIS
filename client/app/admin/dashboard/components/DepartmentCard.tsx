interface Department {
  id: string;
  name: string;
}

interface DepartmentCardProps {
  departments: Department[];
  isLoading: Boolean;
}

const DepartmentCard = ({ departments, isLoading }: DepartmentCardProps) => {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-medium text-gray-800">
          Departments ({departments.length})
        </h2>
      </div>
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {departments.map((dept) => (
          <li
            key={dept.id}
            className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 text-sm text-gray-700 font-medium hover:border-red-200 hover:bg-red-50/30 transition-colors"
          >
            {dept.name}
          </li>
        ))}
        {departments.length === 0 && (
          <li className="text-gray-500 text-sm text-center py-4">No departments found</li>
        )}
      </ul>
    </div>
  );
};

export default DepartmentCard;
