import { loadLocalEnv } from "./load-env.js";
import { buildApp } from "./app.js";

async function start() {
  loadLocalEnv();
  const app = await buildApp();

  try {
    await app.listen({
      host: "0.0.0.0",
      port: app.config.PORT,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
