const timerController = require("./controllers");
const WebSocket = require("ws");
const CronJob = require("cron").CronJob;

const wss = new WebSocket.Server({ port: 8080 });

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
//TODO: implement cron, needs access to the id along with the scoped ws to send to the right client

wss.on("connection", function connection(ws) {
  const cronJob = new CronJob("* * * * * *", () => timerController.cron(ws));
  cronJob.start();
  ws.on("message", reqString => {
    const req = JSON.parse(reqString);
    timerController.message(req, ws);
  });
});
