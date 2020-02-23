const makeDecrementTimer = require("./decrement-timer");
const makeStop = require("./stop");
const makeEnqueue = require("./enqueue");
const makeDequeue = require("./dequeue");
const makeListQueue = require("./listQueue");
const dataAccess = require("../data-access");

const { timersDb, queue } = dataAccess;

const decrementTimer = makeDecrementTimer({ timersDb });
const stop = makeStop({ timersDb });
const enqueue = makeEnqueue({ queue });
const dequeue = makeDequeue({ queue });
const listQueue = makeListQueue({ queue });

const timerService = Object.freeze({
  decrementTimer,
  stop,
  enqueue,
  dequeue,
  listQueue
});

module.exports = timerService;
