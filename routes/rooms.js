const express = require('express')
const axios = require('axios')
const {printRoomsInfo} = require('../src/slack')
const authenticateRequest = require('../middleware/slackAuthMiddleware')

const router = express.Router()

router.use(authenticateRequest)

router.post('/rooms', async (req, res) => {
  const office = req.body.text.trim().toUpperCase()
  const delayedResponeUrl = req.body.response_url

  // Imidiate response (timeout = 3 sec.)
  res.status(200).send('Roombot is processing your request...')

  // Delayed response (google API calls > 3s)
  const responseData = await printRoomsInfo(office)
  axios.post(delayedResponeUrl, responseData)
    .catch((error) => {
      console.log(error.response)
    })
})

module.exports = router
