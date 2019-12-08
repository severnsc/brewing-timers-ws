const makeEnqueue = ({ queue }) => async ({ id }) => {
  if (!id) {
    throw new Error("You must supply an id!");
  }

  const enqueued = await queue.enqueue(id);

  return {
    message: enqueued.getMessage()
  };
};

module.exports = makeEnqueue;
