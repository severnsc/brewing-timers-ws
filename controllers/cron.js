const makeCron = ({ queue, decrementTimer }) => async req => {
    try {
        const list = await queue.listQueue()
        list.map({ id, res } => {
            const decremented = await decrementTimer({ id })
            res.send(decremented.remainingDuration)
        })
    } catch(e) {
        console.error(e)
        res.send(e.message)
    }
}

module.exports = makeCron