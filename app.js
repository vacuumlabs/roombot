const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const roomsRouter = require('./routes/rooms')
//const testRouter = require('./routes/test')
const axios = require('axios')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  try {
    const response = await axios.post('https://roombot-test.free.beeceptor.com', {data: {data: 'Hello there!'}})
    res.send(response)
  } catch (err) {
    res.send('Error')
  }
  //axios.post('https://roombot-test.free.beeceptor.com')
  //http.get('https://roombot-test.free.beeceptor.com')
  //res.send('Roombot says Hello!')
})

//app.use('/test', testRouter)
app.use('/slack', roomsRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
