import { prisma } from "../lib/prisma.js";

export const GetAllUsersService = async (options?: {
  limit?: number;
  search?: string;
}) => {
  const { limit, search } = options || {};

  const whereClause = search
    ? {
        OR: [{ name: { contains: search } }, { email: { contains: search } }],
      }
    : undefined;

  const users = await prisma.user.findMany({
    where: whereClause,
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      rollNumber: true,
      enrollmentNumber: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get total count for display
  const total = await prisma.user.count({ where: whereClause });

  return { users, total };
};

export const GetUserProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      rollNumber: true,
      enrollmentNumber: true,
      profilePhoto: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  if (!user) throw new Error("User not found");

  return user;
};

export const UpdateStudentDetailsService = async (
  userId: string,
  data: { rollNumber: string; enrollmentNumber: string },
) => {
  // First check if user already has these fields set
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { rollNumber: true, enrollmentNumber: true },
  });

  if (!existingUser) throw new Error("User not found");

  // If already set, prevent update
  if (existingUser.rollNumber || existingUser.enrollmentNumber) {
    throw new Error(
      "Roll number and enrollment number cannot be changed once set",
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      rollNumber: data.rollNumber,
      enrollmentNumber: data.enrollmentNumber,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      rollNumber: true,
      enrollmentNumber: true,
      profilePhoto: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  return user;
};

export const UpdateUserProfilePhotoService = async (
  userId: string,
  profilePhoto: string,
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePhoto,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      rollNumber: true,
      enrollmentNumber: true,
      profilePhoto: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  return user;
};

// Types for bulk user creation
export interface BulkUserData {
  email: string;
  name: string;
  password: string;
  role: "STUDENT" | "HOD" | "LAB_INCHARGE" | "ADMIN";
  departmentName: string;
  rollNumber?: string;
  enrollmentNumber?: string;
}

export interface BulkUserResult {
  success: boolean;
  row: number;
  email: string;
  name: string;
  error?: string;
}

export const BulkCreateUsersService = async (
  users: BulkUserData[],
): Promise<{
  created: number;
  failed: number;
  results: BulkUserResult[];
}> => {
  const bcrypt = await import("bcrypt");
  const results: BulkUserResult[] = [];
  let created = 0;
  let failed = 0;

  // Get all departments for mapping
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
  });
  const deptMap = new Map(departments.map((d) => [d.name.toLowerCase(), d.id]));

  // Get all existing emails to check for duplicates
  const existingEmails = await prisma.user.findMany({
    select: { email: true },
  });
  const emailSet = new Set(existingEmails.map((u) => u.email.toLowerCase()));

  for (let i = 0; i < users.length; i++) {
    const userData = users[i];
    const rowNum = i + 2; // Row number in Excel (1-indexed + header row)

    try {
      // Validate required fields
      if (
        !userData.email ||
        !userData.name ||
        !userData.password ||
        !userData.role ||
        !userData.departmentName
      ) {
        results.push({
          success: false,
          row: rowNum,
          email: userData.email || "N/A",
          name: userData.name || "N/A",
          error:
            "Missing required fields (email, name, password, role, or departmentName)",
        });
        failed++;
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        results.push({
          success: false,
          row: rowNum,
          email: userData.email,
          name: userData.name,
          error: "Invalid email format",
        });
        failed++;
        continue;
      }

      // Check for duplicate email
      if (emailSet.has(userData.email.toLowerCase())) {
        results.push({
          success: false,
          row: rowNum,
          email: userData.email,
          name: userData.name,
          error: "Email already exists",
        });
        failed++;
        continue;
      }

      // Validate role
      const validRoles = ["STUDENT", "HOD", "LAB_INCHARGE", "ADMIN"];
      if (!validRoles.includes(userData.role.toUpperCase())) {
        results.push({
          success: false,
          row: rowNum,
          email: userData.email,
          name: userData.name,
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        });
        failed++;
        continue;
      }

      // Find department
      const departmentId = deptMap.get(userData.departmentName.toLowerCase());
      if (!departmentId) {
        results.push({
          success: false,
          row: rowNum,
          email: userData.email,
          name: userData.name,
          error: `Department "${userData.departmentName}" not found`,
        });
        failed++;
        continue;
      }

      // Validate password length
      if (userData.password.length < 8) {
        results.push({
          success: false,
          row: rowNum,
          email: userData.email,
          name: userData.name,
          error: "Password must be at least 8 characters",
        });
        failed++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.default.hash(userData.password, 10);

      // Create user
      await prisma.user.create({
        data: {
          email: userData.email.toLowerCase(),
          name: userData.name,
          password: hashedPassword,
          role: userData.role.toUpperCase() as
            | "STUDENT"
            | "HOD"
            | "LAB_INCHARGE"
            | "ADMIN",
          departmentId,
          rollNumber: userData.rollNumber || null,
          enrollmentNumber: userData.enrollmentNumber || null,
        },
      });

      // Add to email set to prevent duplicates within the same batch
      emailSet.add(userData.email.toLowerCase());

      results.push({
        success: true,
        row: rowNum,
        email: userData.email,
        name: userData.name,
      });
      created++;
    } catch (error: any) {
      results.push({
        success: false,
        row: rowNum,
        email: userData.email || "N/A",
        name: userData.name || "N/A",
        error: error.message || "Unknown error",
      });
      failed++;
    }
  }

  return { created, failed, results };
};
