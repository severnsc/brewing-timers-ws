const makeDequeue = ({ queue }) => async ({ id }) => {
  if (!id) {
    throw new Error("You must supply an id");
  }

  const dequeued = await queue.dequeue(id);

  return {
    message: dequeued.getMessage()
  };
};

module.exports = makeDequeue;
