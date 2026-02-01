import { prisma } from "../lib/prisma.js";

export const CreateDepartmentService = async (name: string) => {
  let upperCaseName = name.trim().toUpperCase(); // Department should be in uppercase
  const department = await prisma.department.create({
    data: {
      name: upperCaseName,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return department;
};

export const GetAllDepartmentsService = async () => {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return departments;
};
