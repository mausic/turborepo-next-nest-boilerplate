"use server";

import { Prisma, prisma } from "@repo/db";
/**
 * Create a user entry in the database
 * @param userInfo user to be created
 */
export const createUser = async (userInfo: Prisma.UserCreateInput) => {
  try {
    await prisma.user.create({
      data: userInfo,
    });
  } catch (error) {
    console.error(error);
  }
};
