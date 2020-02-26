const crypto = require('crypto')
const qs = require('qs')
const {slackSecret} = require('../config');

function authenticateRequest(req, res, next) {
  const timestamp = req.headers['x-slack-request-timestamp']
  const slackSignature = req.headers['x-slack-signature']
  const requestBody = qs.stringify(req.body, {format: 'RFC1738'})
  const sigBasestring = `v0:${timestamp}:${requestBody}`

  if (!timestamp || !slackSignature) {
    res.status(400).send({error: 'Invalid request'})
  }

  // Prevents replay attack
  const time = Math.floor(new Date().getTime() / 1000)
  if (Math.abs(time - timestamp) > 300) {
    res.status(400).send({error: 'Invalid request'})
  }

  if (!slackSecret) {
    res.status(400).send({error: 'Slack signing secret is empty'})
  }

  const mySignature = `v0=${
    crypto.createHmac('sha256', slackSecret)
      .update(sigBasestring, 'utf8')
      .digest('hex')}`

  if (crypto.timingSafeEqual(
    Buffer.from(mySignature, 'utf8'),
    Buffer.from(slackSignature, 'utf8'))
  ) {
    next()
  } else {
    res.status(400).send({error: 'Verification failed'})
  }
}

module.exports = authenticateRequest
