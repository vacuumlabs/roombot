const {getRoomsInfoRaw} = require('./google')
const {isEmpty} = require('lodash')
const {DateTime} = require('luxon')

const getDurationString = (from, to) => {
  const eventEnds = DateTime.fromMillis(to)
  const now = DateTime.fromMillis(from)
  const availableIn = eventEnds.diff(now, ['hours', 'minutes']).toObject()
  const hString = Math.abs(availableIn.hours) > 0 ? `${Math.abs(availableIn.hours)}h` : ''
  const mString = `${Math.floor(Math.abs(availableIn.minutes))}m`

  return `${hString} ${mString}`
}

const isToday = (currentTimestamp, end) => {
  const eventEnds = DateTime.fromMillis(end)
  const endOfDay = DateTime.fromMillis(currentTimestamp).endOf('day')

  return eventEnds < endOfDay
}

const getAttachmentFields = (roomInfo) => {
  const fields = []

  if (roomInfo.eventEnds) {
    const eventEnds = DateTime.fromMillis(roomInfo.eventEnds).setZone(roomInfo.timeZone)
    const endDateString = isToday(roomInfo.currentTimestamp, roomInfo.eventEnds)
      ? ''
      : `${eventEnds.toLocaleString(DateTime.DATE_MED)} `

    fields.push({
      title: 'Event ends',
      value: `${endDateString}${eventEnds.toLocaleString(DateTime.TIME_24_SIMPLE)}`,
      short: true,
    })
  }

  fields.push({
    title: 'Next event',
    value: (roomInfo.nextEventStarts)
      ? DateTime.fromMillis(roomInfo.nextEventStarts)
        .setZone(roomInfo.timeZone)
        .toLocaleString(DateTime.TIME_24_SIMPLE)
      : `No ${roomInfo.eventEnds ? 'other ' : ''}events today`,
    short: true,
  })

  return fields
}

const getFormatedAttachement = (roomInfo) => {

  const availableFor = roomInfo.nextEventStarts
    ? ` _for ${getDurationString(
      roomInfo.nextEventStarts,
      roomInfo.currentTimestamp,
    )}_`
    : undefined

  return {
    fallback: roomInfo.roomName,
    color: roomInfo.available ? 'good' : 'danger',
    title: roomInfo.roomName,
    text: roomInfo.available
      ? `Available${availableFor || ''}`
      : `Unavailable  _available in ${getDurationString(
        roomInfo.currentTimestamp,
        roomInfo.eventEnds,
      )}_`,
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
    text: `Rooms availability info for office: ${office}\n<https://calendar.google.com/calendar/r|Book a room>`,
    attachments,
  }

  return formatedOutput
}

module.exports = {printRoomsInfo}
