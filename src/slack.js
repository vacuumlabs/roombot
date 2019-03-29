const {getRoomsInfoRaw} = require('./google')
const {isEmpty} = require('lodash')


const printRoomsInfo = async (office) => {
  const roomsInfo = await getRoomsInfoRaw(office)

  const attachments = isEmpty(roomsInfo)
    ? [{
      fallback: 'No rooms recognized for this office!',
      color: 'warning',
      title: 'No rooms recognized for this office!',
    }]
    : Object.keys(roomsInfo).map((key) => {
      return {
        fallback: roomsInfo[key].roomName,
        color: roomsInfo[key].available ? 'good' : 'danger',
        title: roomsInfo[key].roomName,
        text: roomsInfo[key].available ? 'Available' : 'Unavailable',
      }
    })

  const formatedOutput = {
    text: 'The rooms availability info: ',
    attachments,
  }

  return formatedOutput
}

module.exports = {printRoomsInfo}
