const {getRoomsInfoRaw} = require('./google')
const {isEmpty} = require('lodash')
const moment = require('moment-timezone')

const getAttachmentFields = (roomInfo) => {
  const fields = []

  if (roomInfo.nextEventStarts) {
    fields.push({
      title: 'Next event',
      value: moment(roomInfo.nextEventStarts)
        .tz(roomInfo.timeZone)
        .format('HH:mm'),
      short: false,
    })
  }

  if (roomInfo.eventEnds) {
    fields.push({
      title: 'Event ends',
      value: moment(roomInfo.eventEnds)
        .tz(roomInfo.timeZone)
        .format('HH:mm'),
      short: false,
    })
  }

  return fields
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
