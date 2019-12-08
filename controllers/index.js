import timersService from "../use-cases";
import makeMessageController from "./message";
import makeStartController from "./start";
import makeStopController from "./stop";

const startController = makeStartController(timersService.enqueue);
const stopController = makeStopController(timersService.dequeue);
const messageController = makeMessageController({
  startController,
  stopController
});

const timerController = Object.freeze({
  messageController
});

export default timerController;
