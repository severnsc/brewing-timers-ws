const timersService = require("../use-cases");
const makeMessageController = require("./message");
const makeStartController = require("./start");
const makeStopController = require("./stop");
const makeCron = require("./cron");

const startController = makeStartController(timersService.enqueue);
const stopController = makeStopController({
  deQueueId: timersService.dequeue,
  stopTimer: timersService.stop
});
const messageController = makeMessageController({
  startController,
  stopController
});
const cronController = makeCron({
  listQueue: timersService.listQueue,
  decrementTimer: timersService.decrementTimer
});

const timerController = Object.freeze({
  message: messageController,
  cron: cronController
});

module.exports = timerController;
