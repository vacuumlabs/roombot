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

const getSuffix = (floor) => {
  const suffixes = {
    1: 'st',
    2: 'nd',
    3: 'rd',
  }
  return suffixes[parseInt(floor, 10)] || 'th'
}

const parseRoomName = (serializedRoomName, withDevices) => {
  const s = serializedRoomName.substring(3)
  const [office, floor, s1] = s.split('-')
  const [name, s2] = s1.split('(')
  const [persons, s3] = s2.split(')')

  let infoString
  if (withDevices) {
    const devices = s3.replace('[', '').replace(']', '').toLowerCase()
    infoString = `_${office.trim()}, ${floor.trim()}${getSuffix(floor.trim())} floor, ${persons.trim()} persons, with: ${devices.trim()}_\n`
  } else {
    infoString = `_${office.trim()}, ${floor.trim()}${getSuffix(floor.trim())} floor, ${persons.trim()} persons_\n`
  }

  return {
    name: name.trim(),
    info: infoString,
  }
}

const getRoomNameAndInfo = (roomName) => {
  const withDevicesRegex = RegExp('HQ\\s[A-Z]+-\\d+-[A-Za-z\\s\']+\\(\\d+\\)\\s\\[[A-Za-z\\s,]+\\]')
  const withoutDevicesRegex = RegExp('HQ\\s[A-Z]+-\\d+-[A-Za-z\\s\']+\\(\\d+\\)')
  if (withDevicesRegex.test(roomName)) {
    return parseRoomName(roomName, true)
  } else if (withoutDevicesRegex.test(roomName)) {
    return parseRoomName(roomName, false)
  } else {
    return {
      name: roomName,
      info: '',
    }
  }
}

const getFormatedAttachement = (roomInfo) => {

  const roomNameAndInfo = getRoomNameAndInfo(roomInfo.roomName)

  const availableFor = roomInfo.nextEventStarts
    ? ` _for ${getDurationString(
      roomInfo.nextEventStarts,
      roomInfo.currentTimestamp,
    )}_`
    : undefined

  const availabilityText = roomInfo.available
    ? `Available${availableFor || ''}`
    : `Unavailable - _available in ${getDurationString(
      roomInfo.currentTimestamp,
      roomInfo.eventEnds,
    )}_`

  return {
    fallback: roomInfo.roomName,
    color: roomInfo.available ? 'good' : 'danger',
    title: roomNameAndInfo.name,
    text: `${roomNameAndInfo.info}${availabilityText}`,
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
