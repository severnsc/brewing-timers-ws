const timerController = require("./controllers");
const WebSocket = require("ws");
const PubSub = require("pubsub-js");

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
const TIMERS = "TIMERS";
const CACHE = "CACHE";
wss.on("connection", function connection(ws) {
  const token = PubSub.subscribe(TIMERS, (msg, data) => ws.send(data));
  let cacheToken;
  const messenger = {
    send: (message) => {
      PubSub.publish(TIMERS, message);
      if (message == 0) {
        cache[ws.userId] = null;
        return PubSub.unsubscribe(cacheToken);
      }
      PubSub.publish(CACHE, message);
    },
  };
  ws.on("message", (reqString) => {
    const req = JSON.parse(reqString);
    if (req.type === "start") {
      if (!req.userId) {
        ws.send("You must provide a userId!");
      } else {
        ws.userId = req.userId;
        cacheToken = PubSub.subscribe(CACHE, (msg, data) => {
          cache[req.userId] = { ...cache[req.userId], remainingDuration: data };
          console.log(cache[req.userId]);
        });
        cache[req.userId] = {
          id: req.id,
          duration: req.duration,
          remainingDuration: req.duration,
        };
      }
    }
    if (req.type === "stop") {
      PubSub.unsubscribe(cacheToken);
      delete cache[ws.userId];
      console.log(cache);
    }
    timerController.message(req, messenger);
  });
  ws.on("close", () => {
    PubSub.unsubscribe(token);
  });
});
