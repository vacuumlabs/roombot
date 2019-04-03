const express = require('express')
const axios = require('axios')
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
    const delayedResponeUrl = req.body.response_url
    res.status(200).send()

    const responseData = await printRoomsInfo(office)
    axios.post(delayedResponeUrl, responseData)
  })

module.exports = router
