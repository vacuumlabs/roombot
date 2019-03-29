const {getRoomsInfoRaw} = require('./google')
const {isEmpty} = require('lodash')
const {DateTime} = require('luxon')

const getDurationString = (from, to) => {
  const eventEnds = DateTime.fromMillis(to)
  const now = DateTime.fromMillis(from)
  const availableIn = eventEnds.diff(now, ['hours', 'minutes']).toObject()
  const hString = Math.abs(availableIn.hours) > 0 ? `${Math.abs(availableIn.hours)}h` : undefined
  const mString = `${Math.floor(Math.abs(availableIn.minutes))}m`

  return `${hString || ''} ${mString || ''}`
}

const getAttachmentFields = (roomInfo) => {
  const fields = []

  if (roomInfo.eventEnds) {

    fields.push({
      title: 'Event ends',
      value: DateTime.fromMillis(roomInfo.eventEnds)
        .setZone(roomInfo.timeZone)
        .toLocaleString(DateTime.TIME_24_SIMPLE),
      short: true,
    })
  }

  if (roomInfo.nextEventStarts) {
    fields.push({
      title: 'Next event',
      value: DateTime.fromMillis(roomInfo.nextEventStarts)
        .setZone(roomInfo.timeZone)
        .toLocaleString(DateTime.TIME_24_SIMPLE),
      short: true,
    })
  }

  return fields
}

const getFormatedAttachement = (roomInfo) => {

  const availableFor = roomInfo.nextEventStarts
    ? ` for ${getDurationString(
      roomInfo.nextEventStarts,
      roomInfo.currentTimestamp,
    )}`
    : undefined

  return {
    fallback: roomInfo.roomName,
    color: roomInfo.available ? 'good' : 'danger',
    title: roomInfo.roomName,
    text: roomInfo.available
      ? `Available${availableFor || ''}`
      : `Unavailable    available in ${getDurationString(
        roomInfo.currentTimestamp,
        roomInfo.eventEnds,
      )}`,
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
