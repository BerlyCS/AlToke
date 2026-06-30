import { Elysia } from "elysia";
import { serverConfig } from "./config";
import { authRoutes } from "./modules/auth";
import { userRoutes } from "./modules/user";
// @ts-ignore
import { cors } from "@elysiajs/cors";

export const app = new Elysia()
  // @ts-ignore
  .use(cors())
  .get("/", () => "API AlToke")
  .group("/api", (app) => app.use(authRoutes).use(userRoutes));

if (import.meta.main) {
  const server = app.listen(serverConfig);

  console.log(
    `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`,
  );
}
