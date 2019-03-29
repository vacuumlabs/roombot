const {WebClient} = require('@slack/client')
const {SLACK_TOKEN} = process.env
const {getRoomsInfoRaw} = require('./google')

const web = new WebClient(SLACK_TOKEN)

const printRoomsInfo = async () => {
  const roomsInfo = await getRoomsInfoRaw()
  const res = await web.auth.test()

  // Find your user id to know where to send messages to
  const userId = res.user_id

  // Use the `chat.postMessage` method to send a message from this app
  const formatedOutput = {
    channel: userId,
    text: 'The rooms availability info: ',
    attachments: Object.keys(roomsInfo).map((key) => {
      return {
        fallback: roomsInfo[key].roomName,
        color: 'warning',
        title: roomsInfo[key].roomName,
        text: roomsInfo[key].available ? 'Available' : 'Unavailable',
      }
    }),
  }

  web.chat.postMessage(formatedOutput)
}

module.exports = {printRoomsInfo}
