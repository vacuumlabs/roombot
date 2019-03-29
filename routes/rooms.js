const express = require('express')
const {getRoomsInfoRaw} = require('../src/google')
const {printRoomsInfo} = require('../src/slack')

const router = express.Router()

router.get('/rooms/raw', async (req, res) => {
  res.send(await getRoomsInfoRaw())
})
router.post('/rooms', async (req, res) => {
  const office = req.query.text.trim()
  res.status(200).send(await printRoomsInfo())
})

module.exports = router
