const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 3000;

export const resolveServerConfig = (env: NodeJS.ProcessEnv = process.env) => {
  const parsedPort = Number.parseInt(env.PORT ?? "", 10);

  return {
    hostname: env.HOST?.trim() || DEFAULT_HOST,
    port:
      Number.isInteger(parsedPort) && parsedPort > 0
        ? parsedPort
        : DEFAULT_PORT,
  };
};

export const serverConfig = resolveServerConfig();
