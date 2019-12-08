const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

//Happy path: Receive a starting number of ms,
//decrement by 1000 ms every 1000 ms until 0
//is reached. Send a message back with the updated
//ms every 1000 ms.

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(ms) {
    let msState = ms;
    const decrementInterval = setInterval(() => {
      msState -= 1000;
      ws.send(msState);
    }, 1000);
  });

  ws.send("something");
});
