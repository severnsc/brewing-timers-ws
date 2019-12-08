const timersService = require("../use-cases");
const makeMessageController = require("./message");
const makeStartController = require("./start");
const makeStopController = require("./stop");
const makeCron = require("./cron");

const startController = makeStartController(timersService.enqueue);
const stopController = makeStopController(timersService.dequeue);
const messageController = makeMessageController({
  startController,
  stopController
});
const cronController = makeCron(timersService.listQueue);

const timerController = Object.freeze({
  message: messageController,
  cron: cronController
});

module.exports = timerController;
