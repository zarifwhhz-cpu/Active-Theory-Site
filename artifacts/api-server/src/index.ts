import app from "./app";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, () => {
  console.log(
    JSON.stringify({
      t: new Date().toISOString(),
      lvl: "info",
      msg: `Server listening on port ${port}`,
    }),
  );
});

let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(
    JSON.stringify({
      t: new Date().toISOString(),
      lvl: "info",
      msg: `${signal} received, shutting down`,
    }),
  );

  const forceExit = setTimeout(() => {
    console.error(
      JSON.stringify({
        t: new Date().toISOString(),
        lvl: "error",
        msg: "Shutdown timed out, forcing exit",
      }),
    );
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  // Stop accepting new connections immediately, drain in-flight, and close the
  // DB pool in parallel so a slow keep-alive socket doesn't block pool.end().
  const closeServer = new Promise<Error | undefined>((resolve) => {
    server.close((err) => resolve(err ?? undefined));
  });

  Promise.allSettled([closeServer, pool.end()])
    .then((results) => {
      const httpResult = results[0];
      const poolResult = results[1];
      let exitCode = 0;
      if (httpResult.status === "fulfilled" && httpResult.value) {
        console.error(
          JSON.stringify({
            t: new Date().toISOString(),
            lvl: "error",
            msg: "Error closing HTTP server",
            error: httpResult.value.message,
          }),
        );
        exitCode = 1;
      }
      if (poolResult.status === "rejected") {
        console.error(
          JSON.stringify({
            t: new Date().toISOString(),
            lvl: "error",
            msg: "Error closing DB pool",
            error:
              poolResult.reason instanceof Error
                ? poolResult.reason.message
                : String(poolResult.reason),
          }),
        );
        exitCode = 1;
      }
      process.exit(exitCode);
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error(
    JSON.stringify({
      t: new Date().toISOString(),
      lvl: "error",
      msg: "Unhandled promise rejection",
      reason: reason instanceof Error ? reason.message : String(reason),
    }),
  );
});

process.on("uncaughtException", (err) => {
  console.error(
    JSON.stringify({
      t: new Date().toISOString(),
      lvl: "error",
      msg: "Uncaught exception",
      error: err.message,
      stack: err.stack,
    }),
  );
  shutdown("uncaughtException");
});
