const makeDecrementTimer = require("./decrement-timer");
const makeEnqueue = require("./enqueue");
const makeDequeue = require("./dequeue");
const makeListQueue = require("./listQueue");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

const createMockTimer = id => {
  const duration = getRandomInt(1000, 9000);
  const remainingDuration = getRandomInt(duration, 9000);
  return {
    id,
    duration,
    remainingDuration
  };
};
const inMemoryDb = {};
let inMemoryQueue = [];

const timersDb = Object.freeze({
  findById: ({ id }) => {
    const object = inMemoryDb[id];
    return Promise.resolve(object);
  },
  insert: timer => {
    if (!inMemoryDb[timer.id]) {
      inMemoryDb[timer.id] = timer;
    }
  },
  update: timer => {
    inMemoryDb[timer.id] = timer;
    return Promise.resolve();
  }
});

const queueResponse = Object.freeze({
  getMessage: () => "message"
});

const queue = Object.freeze({
  enqueue: id => {
    timersDb.insert(createMockTimer(id));
    inMemoryQueue.push(id);
    return Promise.resolve(queueResponse);
  },
  dequeue: id => {
    inMemoryQueue = inMemoryQueue.filter(item => item !== id);
    return Promise.resolve(queueResponse);
  },
  get: () => Promise.resolve(inMemoryQueue)
});

const decrementTimer = makeDecrementTimer({ timersDb });
const enqueue = makeEnqueue({ queue });
const dequeue = makeDequeue({ queue });
const listQueue = makeListQueue({ queue });

const timerService = Object.freeze({
  decrementTimer,
  enqueue,
  dequeue,
  listQueue
});

module.exports = timerService;
