const express = require('express')
const router = express.Router()

// Getting great
router.get('/', (req, res) => {
    res.send('Hellooo')
})

router.get('/:id', (req, res) => {
    res.send(req.params.id)
})

module.exports = router