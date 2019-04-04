const express = require('express')
const {getRoomsInfoRaw} = require('../src/google')

const router = express.Router()

router.get('/', async (req, res) => {
  res.send(await getRoomsInfoRaw('BA'))
})

module.exports = router
