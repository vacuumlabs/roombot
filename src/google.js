const {google} = require('googleapis')
const {CALENDARS} = require('./constants')
const privatekey = require('../private_key.json')


const scopes = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
]

const jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  scopes,
)

const calendar = google.calendar({
  version: 'v3',
})

google.options({
  auth: jwtClient,
})

const getCalendars = async (office) => {

  const timeMax = new Date()
  timeMax.setDate(timeMax.getDate() + 1)
  timeMax.setHours(0, 0, 0, 0)

  const timeMin = new Date()

  const calendars = {}
  for (const key in CALENDARS[office]) {
    const res = await calendar.events.list({
      calendarId: CALENDARS[office][key].googleId,
      alwaysIncludeEmail: false,
      maxAttendees: 1,
      maxResults: 2,
      orderBy: 'startTime',
      singleEvents: true,
      timeMax: timeMax.toISOString(),
      timeMin: timeMin.toISOString(),
      fields: 'timeZone , summary, items',
    })
    calendars[key] = res.data
  }

  return calendars
}

const getRoomAvailability = (eventTimes, currentTimestamp) => {
  for (const event of eventTimes) {
    if (currentTimestamp >= event.start && currentTimestamp < event.end) {
      return false
    }
  }
  return true
}

const getCurrentEventEnd = (
  eventTimes,
  currentTimestamp,
) => {
  for (const event of eventTimes) {
    if (currentTimestamp >= event.start && currentTimestamp < event.end) {
      return event.end
    }
  }
  return undefined
}

const getNextEventStart = (
  eventTimes,
  currentTimestamp,
) => {
  for (const event of eventTimes) {
    if (currentTimestamp <= event.start) {
      return event.start
    }
  }
  return undefined
}

const getRoomInfo = (calendar) => {
  const currentTimestamp = new Date().getTime()

  const eventTimes = calendar.items.map((event) => {
    return {
      start: new Date(event.start.dateTime).getTime(),
      end: new Date(event.end.dateTime).getTime(),
    }
  })

  const available = getRoomAvailability(eventTimes, currentTimestamp)
  const eventEnds = !available
    ? getCurrentEventEnd(
      eventTimes,
      currentTimestamp,
    )
    : undefined

  const nextEventStarts = getNextEventStart(
    eventTimes,
    currentTimestamp,
  )

  return {
    roomName: calendar.summary,
    available,
    eventEnds,
    nextEventStarts,
    timeZone: calendar.timeZone,
    currentTimestamp,
  }
}

const getRoomsInfoRaw = async (office) => {
  const calendars = await getCalendars(office)
  const resultMap = {}
  for (const key in calendars) {
    resultMap[key] = getRoomInfo(calendars[key])
  }
  return resultMap
}

module.exports = {getRoomsInfoRaw}
