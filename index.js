const timerController = require("./controllers");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT });

//Happy path: Receive a starting number of ms,
//decrement by 1000 ms every 1000 ms until 0
//is reached. Send a message back with the updated
//ms every 1000 ms.

//Controller
//(req, res) => undefined

//Timer: {id, duration, remainingDuration}
//Timer, getter to retrieve a timer by id, decrement logic
//Always returns Timer object
//Getter: timerById(id: string) => Timer
//Decrement: timer.decrement() => Timer

//Entity - Timer
//Use Cases - Getting, Decrementing
//Controller - req/res layer, start, stop, cronjob
//Frameworks & Drivers - websockets, cache, persistence, cron
//TODO: clear queue on close
const envVars = {
  GRAPHQL_API: process.env.GRAPHQL_API,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};
if (Object.values(envVars).some((envVar) => envVar === undefined)) {
  const unsetVars = Object.keys(envVars).filter(
    (envVar) => process.env[envVar] === undefined
  );
  wss.close(() =>
    console.log("Environment variables are not set: ", unsetVars)
  );
}
const cache = {};

wss.on("connection", function connection(ws, request) {
  ws.isAlive = true;
  ws.on("pong", heartbeat);
  ws.writeState = "normal";
  let userId;
  const makeWriteStateMachine = ({ ws }) => {
    return {
      send: (message) => {
        if (ws.writeState === "normal") {
          ws.send(message);
        }
        if (ws.writeState === "cacheWrite") {
          cache[userId] = message;
        }
      },
    };
  };
  const writeStateMachine = makeWriteStateMachine({
    ws,
    timerController,
  });
  const isUserInCache = userId && Object.keys(cache).includes(userId);
  let readState = isUserInCache ? "readCache" : "normal";
  const makeReadStateMachine = ({ ws, timerController }) => {
    setTimeout(function run() {
      if (readState === "readCache") {
        const cached = cache[userId];
        ws.send(cached);
        setTimeout(run, 1000);
      }
    }, 1000);
    return (req) => {
      if (readState === "readCache") {
        if (req.type === "stop") {
          delete cache[userId];
          readState = "normal";
        }
        if (req.type === "start") {
          return;
        }
      }
      return timerController.message(req, ws);
    };
  };
  const readStateMachine = makeReadStateMachine({
    ws: writeStateMachine,
    timerController,
  });
  ws.on("message", (reqString) => {
    const req = JSON.parse(reqString);
    if (!userId) {
      if (req.type !== "userId") {
        return ws.send("userId required to begin");
      } else {
        return (userId = req.userId);
      }
    } else {
      readStateMachine(req);
    }
  });
});
function noop() {}

function heartbeat() {
  this.isAlive = true;
}
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    console.log(ws.isAlive);
    if (ws.isAlive === false) {
      ws.writeState = "cacheWrite";
      cache[userId] = true;
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 1000);
wss.on("close", function close() {
  clearInterval(interval);
});
