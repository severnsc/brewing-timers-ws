const makeEnqueue = ({ queue }) => async ({
  id,
  duration,
  alerts,
  sendResponse,
  to,
}) => {
  if (!id) {
    throw new Error("You must supply an id!");
  }

  const enqueued = await queue.enqueue({
    id,
    duration,
    alerts,
    sendResponse,
    to,
  });

  return {
    message: enqueued.getMessage(),
  };
};

module.exports = makeEnqueue;
