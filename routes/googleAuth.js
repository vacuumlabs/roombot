const express = require('express')
const {authorize, getRefreshToken} = require('../src/google')

const router = express.Router()

router.get('/auth', (req, res) => {
  res.redirect(authorize())
})

router.get('/recievecode', async (req, res) => {
  const refreshToken = await getRefreshToken(req.query.code)
  res.send(`Refresh token is: ${refreshToken}`)
})

module.exports = router
