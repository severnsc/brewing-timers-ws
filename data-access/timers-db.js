function makeTimersDb({ makeDb }) {
  return Object.freeze({
    findById,
    update
  });
  async function findById({ id }) {
    const db = await makeDb();
    const result = await db.findById(id);
    return result;
  }
  async function update(timer) {
    const db = await makeDb();
    const result = await db.update(timer);
    return result;
  }
}

module.exports = makeTimersDb;
