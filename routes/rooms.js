const express = require('express')
const {getRoomsInfoRaw} = require('../src/google')
const {printRoomsInfo} = require('../src/slack')
const authenticateRequest = require('../middleware/slackAuthMiddleware')

const router = express.Router()

router
  .use(authenticateRequest)
  .get('/rooms/raw', async (req, res) => {
    res.send(await getRoomsInfoRaw('BA'))
  })
  .post('/rooms', async (req, res) => {
    const office = req.body.text.trim().toUpperCase()
    res.status(200).send(await printRoomsInfo(office))
  })

module.exports = router
