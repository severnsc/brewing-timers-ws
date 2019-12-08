const makeCron = ({ listQueue, decrementTimer }) => async () => {
    try {
        const list = await listQueue()
        list.forEach({ id, res } => {
            const decremented = await decrementTimer({ id })
            res.send(decremented.remainingDuration)
        })
    } catch(e) {
        console.error(e)
        res.send(e.message)
    }
}

module.exports = makeCron