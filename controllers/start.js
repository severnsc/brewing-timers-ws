const makeStart = queueId => async (req, res) => {
  const id = req.id;
  if (!id) {
    res.send("must include id on request object");
  }
  try {
    const queued = await queueId(id);
    res.send(queued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

export default makeStart;
