const makeDecrementTimer = require("./decrement-timer");
const makeStop = require("./stop");
const makeEnqueue = require("./enqueue");
const makeDequeue = require("./dequeue");
const makeListQueue = require("./listQueue");
const dataAccess = require("../data-access");

const {
  stopTimersDb,
  decrementTimersDb,
  makeMakeQueue,
  makeIdQueue,
} = dataAccess;

const decrementTimer = makeDecrementTimer({ timersDb: decrementTimersDb });
const makeQueue = makeMakeQueue({ decrementTimer });
const idQueue = makeIdQueue({ makeQueue });
const stop = makeStop({ timersDb: stopTimersDb });
const enqueue = makeEnqueue({ queue: idQueue });
const dequeue = makeDequeue({ queue: idQueue });
const listQueue = makeListQueue({ queue: idQueue });

const timerService = Object.freeze({
  decrementTimer,
  stop,
  enqueue,
  dequeue,
  listQueue,
});

module.exports = timerService;
