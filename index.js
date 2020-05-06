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

wss.on("connection", function connection(ws) {
  const token = PubSub.subscribe("TIMERS", (msg, data) => ws.send(data));
  ws.on("message", (reqString) => {
    const req = JSON.parse(reqString);
    const messenger = {
      send: (message) => {
        PubSub.publish("TIMERS", message);
      },
    };
    timerController.message(req, messenger);
  });
  ws.on("close", () => {
    PubSub.unsubscribe(token);
  });
});
