const express = require('express')
const {getRoomsInfoRaw} = require('../src/google')
const {printRoomsInfo} = require('../src/slack')

const router = express.Router()

router.get('/rooms/raw', async (req, res) => {
  res.send(await getRoomsInfoRaw())
})
router.post('/rooms', (req, res) => {
  res.status(200).send(printRoomsInfo())
})

module.exports = router
