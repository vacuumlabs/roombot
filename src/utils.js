const axios = require('axios')

const keepMeAwake = () => {
  setInterval(
    () => axios.get('https://roombot-vacuumlabs.now.sh'),
    5000,
  )
}

module.exports = {keepMeAwake}