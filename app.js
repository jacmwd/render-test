const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const express = require('express')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
 .then(() => {
  logger.info('connected to MONGODB_URI')
 })
 .catch((error) => {
  logger.info('error connecting to MONGODB:', error.message)
 })

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(middleware.requestLogger)

app.use('/api/notes',notesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app