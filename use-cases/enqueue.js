const makeEnqueue = ({ queue }) => async ({ id, duration, sendResponse }) => {
  if (!id) {
    throw new Error("You must supply an id!");
  }

  const enqueued = await queue.enqueue({ id, duration, sendResponse });

  return {
    message: enqueued.getMessage(),
  };
};

module.exports = makeEnqueue;
