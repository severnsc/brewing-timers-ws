const dataAccess = require("../data-access");
const timersService = require("../use-cases");
const makeMessageController = require("./message");
const makeStartController = require("./start");
const makeStopController = require("./stop");

const startController = makeStartController(timersService.enqueue);
const stopController = makeStopController({
  deQueueId: timersService.dequeue,
  stopTimer: timersService.stop,
});
const messageController = makeMessageController({
  startController,
  stopController,
});

const timerController = Object.freeze({
  message: messageController,
});

module.exports = timerController;
