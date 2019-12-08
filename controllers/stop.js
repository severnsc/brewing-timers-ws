const makeStop = deQueueId => async (req, res) => {
  const id = req.id;
  if (!id) {
    res.send("must include id on request object");
  }
  try {
    const dequeued = await deQueueId({ id });
    res.send(dequeued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

export default makeStop;
