const {google} = require('googleapis')
const {CALENDARS} = require('./constants')

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIEN_SECRET,
  GOOGLE_OAUTH_REDIRECT_URL,
} = process.env

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIEN_SECRET,
  GOOGLE_OAUTH_REDIRECT_URL
)

const scopes = ['https://www.googleapis.com/auth/calendar.events.readonly']

const calendar = google.calendar({
  version: 'v3',
})

google.options({
  auth: oauth2Client,
})

const authorize = () => {
  const url = oauth2Client.generateAuthUrl({
    // 'offline' (gets refresh_token)
    access_type: 'offline',
    scope: scopes,
  })

  return url
}

const getRefreshToken = async (code) => {
  const {tokens} = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens.refresh_token
}

const getCalendars = async (office) => {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  })

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
  timeZone,
  available
) => {
  if (available) {
    return undefined
  }

  for (const event of eventTimes) {
    if (currentTimestamp >= event.start && currentTimestamp < event.end) {
      return new Date(event.end).toLocaleString('en-US', {
        timeZone,
      })
    }
  }
  return undefined
}

const getNextEventStart = (
  eventTimes,
  currentTimestamp,
  timeZone,
  available
) => {
  if (!available) {
    return undefined
  }

  for (const event of eventTimes) {
    if (currentTimestamp <= event.start) {
      return new Date(event.start).toLocaleString('en-US', {
        timeZone,
      })
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
  const eventEnds = getCurrentEventEnd(
    eventTimes,
    currentTimestamp,
    calendar.timeZone,
    available,
  )
  const nextEventStarts = getNextEventStart(
    eventTimes,
    currentTimestamp,
    calendar.timeZone,
    available,
  )

  return {
    roomName: calendar.summary,
    available,
    eventEnds,
    nextEventStarts,
    timeZone: calendar.timeZone,
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

module.exports = {authorize, getRefreshToken, getRoomsInfoRaw}
