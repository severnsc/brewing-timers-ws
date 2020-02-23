const makeStop = ({ deQueueId, stopTimer }) => async (req, res) => {
  const id = req.id;
  const remainingDuration = Number(req.remainingDuration);
  if (isNaN(remainingDuration)) {
    throw new Error("Remaining Duration must be a number!");
  }
  try {
    await stopTimer({ id, remainingDuration });
    const dequeued = await deQueueId({ id });
    res.send(dequeued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

module.exports = makeStop;
