const fs = require("fs");
const path = require("path");
const express = require("express");
const { login } = require("./module");

const PORT = Number(process.env.PORT || 3000);
const APPSTATE_FILE = path.join(__dirname, "appstate.json");
const STATE_DIR = path.join(__dirname, "data");
const STATE_FILE = path.join(STATE_DIR, "demonyo-state.json");
const COMMAND_DIR = path.join(__dirname, "modules", "commands");
const RECONNECT_DELAY = 5000;

fs.mkdirSync(STATE_DIR, { recursive: true });
fs.mkdirSync(COMMAND_DIR, { recursive: true });

const app = express();
app.get("/", (_req, res) => res.status(200).send("Demonyo Bot is running."));
app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "demonyo-bot" }));
app.listen(PORT, () => console.log(`[WEB] Listening on port ${PORT}`));

function readAppState() {
  if (process.env.APPSTATE_JSON) {
    try {
      const parsed = JSON.parse(process.env.APPSTATE_JSON);
      if (!Array.isArray(parsed)) throw new Error("APPSTATE_JSON must be an array.");
      return parsed;
    } catch (err) {
      throw new Error(`APPSTATE_JSON is invalid: ${err.message}`);
    }
  }

  if (!fs.existsSync(APPSTATE_FILE)) {
    throw new Error("No appstate found. Add appstate.json or set APPSTATE_JSON in Render Environment Variables.");
  }

  const parsed = JSON.parse(fs.readFileSync(APPSTATE_FILE, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("appstate.json must contain a JSON array.");
  return parsed;
}

const commands = new Map();
for (const file of fs.readdirSync(COMMAND_DIR).filter(f => f.endsWith(".js"))) {
  try {
    const cmd = require(path.join(COMMAND_DIR, file));
    if (!cmd.name || typeof cmd.execute !== "function") continue;
    commands.set(String(cmd.name).toLowerCase(), cmd);
    if (Array.isArray(cmd.aliases)) {
      for (const alias of cmd.aliases) commands.set(String(alias).toLowerCase(), cmd);
    }
    console.log(`[COMMAND] Loaded ${cmd.name}`);
  } catch (err) {
    console.error(`[COMMAND] Failed loading ${file}:`, err.message);
  }
}

function loadPersistentState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return {};
    const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return data && typeof data === "object" ? data : {};
  } catch (err) {
    console.error("[STATE] Could not read state:", err.message);
    return {};
  }
}

function savePersistentState() {
  try {
    const demonyo = commands.get("demonyo");
    if (!demonyo || typeof demonyo.getPersistentState !== "function") return;
    fs.writeFileSync(STATE_FILE, JSON.stringify(demonyo.getPersistentState(), null, 2));
  } catch (err) {
    console.error("[STATE] Could not save state:", err.message);
  }
}

const persisted = loadPersistentState();
const demonyoCommand = commands.get("demonyo");
if (demonyoCommand && typeof demonyoCommand.loadPersistentState === "function") {
  demonyoCommand.loadPersistentState(persisted);
}

let shuttingDown = false;
let loggedIn = false;
let reconnectTimer = null;

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer) return;
  console.log(`[BOT] Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startLogin();
  }, RECONNECT_DELAY);
}

function startLogin() {
  if (shuttingDown) return;

  let appState;
  try {
    appState = readAppState();
  } catch (err) {
    console.error(`[LOGIN] ${err.message}`);
    return;
  }

  console.log("[LOGIN] Connecting with saved appstate...");

  login(
    { appState },
    {
      online: true,
      selfListen: false,
      updatePresence: true,
      autoMarkDelivery: true,
      autoMarkRead: true,
      autoReconnect: true,
      logging: true
    },
    (err, api) => {
      if (err) {
        loggedIn = false;
        console.error("[LOGIN] Failed:", err?.message || err);
        // Keep the saved appstate. A failed attempt is not treated as proof
        // that the stored session is permanently invalid.
        scheduleReconnect();
        return;
      }

      loggedIn = true;
      console.log("======================================");
      console.log("       DEMONYO BOT IS ONLINE");
      console.log("======================================");
      console.log("UID:", api.getCurrentUserID());

      api.listenMqtt(async (listenErr, event) => {
        if (listenErr) {
          loggedIn = false;
          console.error("[MQTT]", listenErr.message || listenErr);
          scheduleReconnect();
          return;
        }

        if (!event || event.type !== "message") return;

        const body = String(event.body || "").trim();
        if (!body) return;

        if (body.startsWith("/")) {
          const args = body.slice(1).trim().split(/\s+/);
          const name = String(args.shift() || "").toLowerCase();
          const command = commands.get(name);
          if (!command) return;

          try {
            await command.execute({ api, event, args });
            savePersistentState();
          } catch (commandErr) {
            console.error(`[COMMAND ${name}]`, commandErr);
          }
          return;
        }

        const demonyo = commands.get("demonyo");
        if (demonyo && typeof demonyo.handleMessage === "function") {
          try {
            await demonyo.handleMessage({ api, event });
          } catch (demonyoErr) {
            console.error("[DEMONYO]", demonyoErr);
          }
        }
      });
    }
  );
}

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  savePersistentState();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  console.log(`[BOT] ${signal} received. State saved.`);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", err => console.error("[PROCESS] Uncaught Exception:", err));
process.on("unhandledRejection", err => console.error("[PROCESS] Unhandled Rejection:", err));

startLogin();
