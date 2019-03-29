const express = require('express')
const {getRoomsInfoRaw} = require('../src/google')
const {printRoomsInfo} = require('../src/slack')

const router = express.Router()

router.get('/rooms/raw', async (req, res) => {
  res.send(await getRoomsInfoRaw())
})
router.post('/rooms', async (req, res) => {
  const office = req.body.text.trim().toUpperCase()
  res.status(200).send(await printRoomsInfo(office))
})

module.exports = router
