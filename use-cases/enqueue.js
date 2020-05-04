const makeEnqueue = ({ queue }) => async ({ id, sendResponse }) => {
  if (!id) {
    throw new Error("You must supply an id!");
  }

  const enqueued = await queue.enqueue({ id, sendResponse });

  return {
    message: enqueued.getMessage(),
  };
};

module.exports = makeEnqueue;
