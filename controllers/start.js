const makeStart = enqueueId => async (req, res) => {
  const id = req.id;
  if (!id) {
    res.send("must include id on request object");
  }
  try {
    const enqueued = await enqueueId(id);
    res.send(enqueued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

export default makeStart;
