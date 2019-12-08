const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

//Happy path: Receive a starting number of ms,
//decrement by 1000 ms every 1000 ms until 0
//is reached. Send a message back with the updated
//ms every 1000 ms.

const START = "start";
const STOP = "stop";
let id = 0;
let intervals = [];

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(req) {
    const json = JSON.parse(req);
    if (json.type === START) {
      id += 1;
      let msState = json.ms;
      const interval = setInterval(() => {
        msState -= 1000;
        ws.send(JSON.stringify({ ms: msState, id }));
      }, 1000);
      intervals.push({ id, interval });
    }
    if (json.type === STOP) {
      const { interval } = intervals.find(i => i.id === json.id);
      clearInterval(interval);
      intervals = intervals.filter(i => i.id !== json.id);
      ws.send("stopped");
    }
  });

  ws.send("something");
});
