const {getRoomsInfoRaw} = require('./google')
const {isEmpty} = require('lodash')
const {DateTime} = require('luxon')

const getDurationString = (from, to) => {
  const eventEnds = DateTime.locale(to)
  const now = DateTime.locale(from)
  const availableIn = eventEnds.diff(now, ['hours', 'minutes']).toObject()
  const hString = availableIn.hours > 0 ? `${availableIn.hours}h` : undefined
  const mString = `${availableIn.minutes}m`

  return `${hString} ${mString}`
}

const getAttachmentFields = (roomInfo) => {
  const fields = []

  if (roomInfo.eventEnds) {

    fields.push({
      title: 'Available in',
      value: getDurationString(roomInfo.currentTimestamp, roomInfo.eventEnds),
      short: true,
    })

    fields.push({
      title: 'Event ends',
      value: DateTime.locale(roomInfo.eventEnds)
        .setZone(roomInfo.timeZone)
        .toLocaleString(DateTime.TIME_24_SIMPLE),
      short: true,
    })
  }

  if (roomInfo.nextEventStarts) {
    fields.push({
      title: 'Next event',
      value: DateTime.locale(roomInfo.nextEventStarts)
        .setZone(roomInfo.timeZone)
        .toLocaleString(DateTime.TIME_24_SIMPLE),
      short: true,
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
