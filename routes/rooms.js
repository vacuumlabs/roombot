const express = require('express')
const axios = require('axios')
const {getRoomsInfoRaw} = require('../src/google')
const {printRoomsInfo} = require('../src/slack')
const authenticateRequest = require('../middleware/slackAuthMiddleware')

const router = express.Router()

//router.use(authenticateRequest)

router.get('/rooms/raw', async (req, res) => {
  res.send(await getRoomsInfoRaw('BA'))
})
router.post('/rooms', async (req, res) => {
  const office = req.body.text.trim().toUpperCase()
  const delayedResponeUrl = req.body.response_url
  res.status(200).send(await printRoomsInfo(office))
/*
  const responseData = await printRoomsInfo(office)
  axios.post(delayedResponeUrl, responseData)
    .catch((error) => {
      console.log(error.response)
    })
    */
})

module.exports = router
