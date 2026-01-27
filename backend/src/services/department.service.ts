import { prisma } from "../lib/prisma.js";

export const CreateDepartmentService = async (name: string) => {

  let upperCaseName = name.trim().toUpperCase();  // Department should be in uppercase
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
