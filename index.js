require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const Note = require('./models/note')


//const password = process.argv[2]

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
    },
    {
        id: "2",
        content: "Browser can only execute Javascript",
        important: false
    },
    {
        id: "3",
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    //response.json(notes)
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    /*const id = request.params.id
    const note = notes.find(note => note.id === id)
    
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }*/
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

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n=>Number(n.id))): 0
    return String (maxId + 1)
}

app.post('/api/notes/', (request, response)=> {
    const body = request.body
    if (!body.content) {
        return response.status(404).json({ error: 'content is missing'})
    }
    /*const note = {
        content: body.content,
        important: Boolean(body.important) || false,
        id: generateId()
    }
    notes = notes.concat(note)
    response.json(note)*/

    const note = new Note({
        content: body.content,
        important: body.important || false
    })

    note.save().then(savedNote => {
        response.json(savedNote)
    })
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
    }
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`server is running on ${PORT}`)