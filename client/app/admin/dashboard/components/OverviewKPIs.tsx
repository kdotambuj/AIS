"use client";

import { useEffect, useState } from "react";

interface KPIData {
  departments: number;
  users: number;
  authorities: number;
  resources: number;
  tickets: number;
}

const OverviewKPIs = () => {
  const [data, setData] = useState<KPIData>({
    departments: 0,
    users: 0,
    authorities: 0,
    resources: 0,
    tickets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const fetchConfig = {
          method: "GET",
          credentials: "include" as RequestCredentials,
        };
        const endpoints = [
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/department/get`,
            fetchConfig,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/users`,
            fetchConfig,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/authority/authorities`,
            fetchConfig,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/resource/get`,
            fetchConfig,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/ticket/get`,
            fetchConfig,
          ),
        ];

        const responses = await Promise.allSettled(endpoints);

        const parseCount = async (res: PromiseSettledResult<Response>) => {
          if (res.status === "fulfilled" && res.value.ok) {
            const body = await res.value.json();
            if (body.success) {
              return body.total !== undefined
                ? body.total
                : body.data?.length || 0;
            }
          }
          return 0;
        };

        setData({
          departments: await parseCount(responses[0]),
          users: await parseCount(responses[1]),
          authorities: await parseCount(responses[2]),
          resources: await parseCount(responses[3]),
          tickets: await parseCount(responses[4]),
        });
      } catch (err) {
        console.error("Failed to load KPIs", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  const cards = [
    { label: "Departments", value: data.departments },
    { label: "Total Users", value: data.users },
    { label: "Authorities", value: data.authorities },
    { label: "Resources", value: data.resources },
    { label: "Total Tickets", value: data.tickets },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center transition-transform hover:-translate-y-1 hover:shadow-md hover:border-red-100 group"
        >
          <div className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            {card.label}
          </div>
          {isLoading ? (
            <div className="h-10 w-16 bg-gray-50 animate-pulse rounded mt-2" />
          ) : (
            <div className="text-4xl font-light text-gray-900 mt-2 tracking-tight">
              {card.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OverviewKPIs;
