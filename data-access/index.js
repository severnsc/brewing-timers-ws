import makeIdQueue from "./queue";
import makeTimersDb from "./timers-db";

async function makeDb() {
  return {
    findById: async () => null,
    update: async () => {}
  };
}

async function makeQueue() {
  return {
    enqueue: async () => true,
    dequeue: async () => true,
    findAll: async () => []
  };
}

const timersDb = makeTimersDb({ makeDb });
const queue = makeIdQueue({ makeQueue });

const dataAccess = Object.freeze({
  timersDb,
  queue
});

module.exports = dataAccess;
