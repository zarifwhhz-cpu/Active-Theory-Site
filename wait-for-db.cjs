// Wait for Postgres to accept TCP connections. Uses only `node:net` so it has
// no external dependencies and works regardless of pnpm hoisting.
const net = require("node:net");

const url = process.env.DATABASE_URL;
if (!url) {
  process.stderr.write('{"lvl":"error","msg":"DATABASE_URL not set"}\n');
  process.exit(1);
}

let host;
let port;
try {
  const parsed = new URL(url);
  host = parsed.hostname || "127.0.0.1";
  port = Number(parsed.port || 5432);
} catch (err) {
  process.stderr.write(
    `{"lvl":"error","msg":"invalid DATABASE_URL","error":"${err.message}"}\n`,
  );
  process.exit(1);
}

const MAX_ATTEMPTS = 60;
const DELAY_MS = 1000;
const TIMEOUT_MS = 2000;

function tryConnect() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(TIMEOUT_MS);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

(async () => {
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    if (await tryConnect()) {
      process.stdout.write(
        `{"lvl":"info","msg":"db reachable at ${host}:${port} after ${i} attempt(s)"}\n`,
      );
      process.exit(0);
    }
    process.stderr.write(
      `{"lvl":"warn","msg":"db not ready (attempt ${i}/${MAX_ATTEMPTS})"}\n`,
    );
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
  process.stderr.write(
    `{"lvl":"error","msg":"db not reachable at ${host}:${port} after ${MAX_ATTEMPTS} attempts"}\n`,
  );
  process.exit(1);
})();
