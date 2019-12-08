const makeStart = enqueueId => async (req, res) => {
  const id = req.id;
  try {
    const enqueued = await enqueueId({ id });
    res.send(enqueued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

export default makeStart;
