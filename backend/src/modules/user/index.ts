import { Elysia, status } from "elysia";
import { UserService } from "./service";
import { UserModel } from "./model";
import { jwt } from "@elysiajs/jwt";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret",
    }),
  )
  .derive(async ({ jwt, headers }) => {
    const authHeader = headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    let userId: string | null = null;
    if (token) {
      const payload = await jwt.verify(token);
      if (payload && payload.id) {
        userId = payload.id as string;
      }
    }

    return {
      userId,
      requireAuth() {
        if (!userId) throw status(401, "Unauthorized");
        return userId;
      },
    };
  })
  .get(
    "/me",
    async ({ requireAuth }) => {
      const userId = requireAuth();
      return await UserService.getProfile(userId);
    },
    {
      response: {
        200: UserModel.profileResponse,
        401: UserModel.unauthorizedError,
        404: UserModel.userError,
      },
    },
  )
  .patch(
    "/me",
    async ({ requireAuth, body }) => {
      const userId = requireAuth();
      return await UserService.updateProfile(userId, body);
    },
    {
      body: UserModel.updateProfileBody,
      response: {
        200: UserModel.profileResponse,
        401: UserModel.unauthorizedError,
        404: UserModel.userError,
      },
    },
  );
