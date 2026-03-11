"use client";

interface ResourceAuthority {
  id: string;
  name: string;
  location: string;
  description?: string;
  department: {
    id: string;
    name: string;
  };
}

interface ResourceAuthoritiesCardProps {
  authorities: ResourceAuthority[];
  isLoading: Boolean;
}

const ResourceAuthoritiesCard = ({
  authorities,
  isLoading,
}: ResourceAuthoritiesCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Resource Authorities ({authorities.length})
      </h2>
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {authorities.map((auth) => (
            <li
              key={auth.id}
              className="p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div className="font-medium">{auth.name}</div>
              <div className="text-sm text-gray-600">{auth.location}</div>
              <div className="text-xs text-gray-500">
                {auth.department?.name}
              </div>
              {auth.description && (
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {auth.description}
                </div>
              )}
            </li>
          ))}
          {authorities.length === 0 && (
            <li className="text-gray-500 text-center py-4">
              No resource authorities found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ResourceAuthoritiesCard;
