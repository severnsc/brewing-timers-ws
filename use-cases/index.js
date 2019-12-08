const makeDecrementTimer = require("./decrement-timer");
const makeEnqueue = require("./enqueue");
const makeDequeue = require("./dequeue");

const timersDb = Object.freeze({
  findById: () => Promise.resolve(),
  update: () => Promise.resolve()
});

const queueResponse = Object.freeze({
  getMessage: () => "message"
});

const queue = Object.freeze({
  enqueue: () => Promise.resolve(queueResponse),
  dequeue: () => Promise.resolve(queueResponse)
});

const decrementTimer = makeDecrementTimer({ timersDb });
const enqueue = makeEnqueue({ queue });
const dequeue = makeDequeue({ queue });

const timerService = Object.freeze({
  decrementTimer,
  enqueue,
  dequeue
});

module.exports = timerService;
