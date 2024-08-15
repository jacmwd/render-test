require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const Note = require('./models/note')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response, next) => {
    Note.find({})
        .then(notes => {
            response.json(notes)
        })
        .catch(error => next(error))
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
        
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/notes/', (request, response, next)=> {
    const body = request.body
    if (!body.content) {
        return response.status(404).json({ error: 'content is missing'})
    }

    const note = new Note({
        content: body.content,
        important: body.important || false
    })

    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next)=> {
    const { content, important } = request.body

    Note.findByIdAndUpdate(
        request.params.id, 
        { content, important }, 
        { new: true, runValidators: true, context: 'query' }
        //set context option to query to set the value of 'this' to query object in validators
    )
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))

})

//middleware catching requests made to unknown routes
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send( { error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`server is running on ${PORT}`)