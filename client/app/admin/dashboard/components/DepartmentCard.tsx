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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Departments ({departments.length})
      </h2>
      <ul className="space-y-2">
        {departments.map((dept) => (
          <li
            key={dept.id}
            className="p-3 bg-gray-50 rounded border border-gray-200"
          >
            {dept.name}
          </li>
        ))}
        {departments.length === 0 && (
          <li className="text-gray-500">No departments found</li>
        )}
      </ul>
    </div>
  );
};

export default DepartmentCard;
