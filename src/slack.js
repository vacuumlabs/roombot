const {getRoomsInfoRaw} = require('./google')


const printRoomsInfo = async () => {
  const roomsInfo = await getRoomsInfoRaw()

  const formatedOutput = {
    text: 'The rooms availability info: ',
    attachments: Object.keys(roomsInfo).map((key) => {
      return {
        fallback: roomsInfo[key].roomName,
        color: roomsInfo[key].available ? 'good' : 'danger',
        title: roomsInfo[key].roomName,
        text: roomsInfo[key].available ? 'Available' : 'Unavailable',
      }
    }),
  }

  return formatedOutput
}

module.exports = {printRoomsInfo}
