const {getRoomsInfoRaw} = require('./google')
const {isEmpty} = require('lodash')
const {DateTime} = require('luxon')

const getAttachmentFields = (roomInfo) => {
  const fields = []

  if (roomInfo.available && roomInfo.nextEventStarts) {
    fields.push({
      title: 'Next event',
      value: DateTime
        .local(roomInfo.nextEventStarts)
        .setZone(roomInfo.timeZone)
        .toLocaleString(DateTime.TIME_24_SIMPLE),
      short: false,
    })
  }

  if (!roomInfo.available) {
    fields.push({
      title: 'Event ends',
      value: DateTime
        .local(roomInfo.eventEnds)
        .setZone(roomInfo.timeZone)
        .toLocaleString(DateTime.TIME_24_SIMPLE),
      short: false,
    })
  }
}

const getFormatedAttachement = (roomInfo) => {
  return {
    fallback: roomInfo.roomName,
    color: roomInfo.available ? 'good' : 'danger',
    title: roomInfo.roomName,
    text: roomInfo.available ? 'Available' : 'Unavailable',
    fields: getAttachmentFields(roomInfo),
  }
}

const printRoomsInfo = async (office) => {
  const roomsInfo = await getRoomsInfoRaw(office)

  const attachments = isEmpty(roomsInfo)
    ? [{
      fallback: 'Unrecognized office',
      color: 'warning',
      title: `Unrecognized office ${office}!`,
    }]
    : Object.keys(roomsInfo).map((key) => getFormatedAttachement(roomsInfo[key]))

  const formatedOutput = {
    text: 'The rooms availability info: ',
    attachments,
  }

  return formatedOutput
}

module.exports = {printRoomsInfo}
