function makeTimersDb({ makeDb }) {
  return Object.freeze({
    findById,
    update
  });
  async function findById({ id }) {
    const db = await makeDb();
    const result = await db.findById(id);
    return {
      id: result.id,
      duration: result.duration,
      remainingDuration: result.remaining_duration
    };
  }
  async function update(timer) {
    const db = await makeDb();
    const result = await db.update(timer);
    return result;
  }
}

module.exports = makeTimersDb;
