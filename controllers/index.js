const timersService = require("../use-cases");
const makeMessageController = require("./message");
const makeStartController = require("./start");
const makeStopController = require("./stop");

const startController = makeStartController(timersService.enqueue);
const stopController = makeStopController(timersService.dequeue);
const messageController = makeMessageController({
  startController,
  stopController
});

const timerController = Object.freeze({
  message: messageController
});

module.exports = timerController;
