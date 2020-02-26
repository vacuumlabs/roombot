// config.js
const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  slackSecret: process.env.SLACK_SIGNING_SECRET,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY_JSON,
}
