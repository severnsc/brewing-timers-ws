const timerController = require("./controllers");
const WebSocket = require("ws");
const PubSub = require("pubsub-js");

const wss = new WebSocket.Server({ port: process.env.PORT });
wss.shouldHandle = (req) => {
  if (req.headers.origin === process.env.ORIGIN) {
    return true;
  }
  return false;
};

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
  TO: process.env.TO,
  MESSAGING_URL: process.env.MESSAGING_URL,
  AUTH0_URL: process.env.AUTH0_URL,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  ORIGIN: process.env.ORIGIN,
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
const TIMERS = "TIMERS";
const CACHE = "CACHE";
wss.on("connection", function connection(ws) {
  let token;
  let cacheToken;
  const messenger = {
    send: (message) => {
      PubSub.publish(ws.userId + TIMERS, message);
      if (message == 0 || message === "Dequeue successful") {
        cache[ws.userId] = null;
        return PubSub.unsubscribe(cacheToken);
      }
      PubSub.publish(ws.userId + CACHE, message);
    },
  };
  ws.on("message", (reqString) => {
    const req = JSON.parse(reqString);
    if (!ws.userId) {
      if (req.type !== "userId") {
        ws.send("You must provide a userId to start!");
      } else {
        ws.userId = req.userId;
        const isUserCached = cache[ws.userId];
        if (isUserCached) {
          if (!token) {
            token = PubSub.subscribe(ws.userId + TIMERS, (msg, data) =>
              ws.send(data)
            );
          }
        }
      }
    } else {
      if (req.type === "start") {
        const isUserCached = cache[ws.userId];
        if (!isUserCached) {
          if (!token) {
            token = PubSub.subscribe(ws.userId + TIMERS, (msg, data) =>
              ws.send(data)
            );
          }
          if (!cacheToken) {
            cacheToken = PubSub.subscribe(ws.userId + CACHE, (msg, data) => {
              cache[ws.userId] = {
                ...cache[ws.userId],
                remainingDuration: data,
              };
            });
          }
          cache[ws.userId] = {
            id: req.id,
            duration: req.duration,
            remainingDuration: req.duration,
          };
          timerController.message(req, messenger);
        }
      }
      if (req.type === "stop") {
        PubSub.unsubscribe(cacheToken);
        delete cache[ws.userId];
        timerController.message(req, messenger);
      }
    }
  });
  ws.on("close", () => {
    PubSub.unsubscribe(token);
  });
});
