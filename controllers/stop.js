const makeStop = deQueueId => async (req, res) => {
  const id = req.id;
  try {
    const dequeued = await deQueueId({ id });
    res.send(dequeued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

export default makeStop;
