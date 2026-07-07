import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      lastName: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "PATIENT",
        input: false, // don't allow user to set role directly
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "VERIFIED",
        input: false, // don't allow user to set status directly
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              medicalProfile: { create: ctx && ctx.body.medicalProfile },
            },
          });
        },
      },
    },
  },
  trustedOrigins: ["exp://192.168.1.21:8081"],
});
