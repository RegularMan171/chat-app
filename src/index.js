const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

let count = 0

io.on('connection', (socket) => {
    
    console.log('new connection')
    socket.emit('message', 'Hello')
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (msg, callback)=> {
        const filter = new Filter()

        if(filter.isProfane(msg)) {
            return callback('Profanity not allowed')
        }

        io.emit('message', msg)
        callback()
    })

    socket.on('sendLocation', (pos, cb) => {
        io.emit('message', `https://google.com/maps?q=${pos.latitude},${pos.longitude}`)
        cb()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user left')
    })
})

server.listen(port, () => {
    console.log(`running on ${port}`)
})