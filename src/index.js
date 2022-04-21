const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMsg, generateLoc} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

let count = 0

io.on('connection', (socket) => {
    
    console.log('new connection')

    socket.on('join', ({username, room}) => {
        socket.join(room)
        console.log(username,room)
        socket.emit('message', generateMsg('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMsg(`${username} has joined!`))
    })

    socket.on('sendMessage', (msg, callback)=> {
        const filter = new Filter()
        if(filter.isProfane(msg)) {
            return callback('Profanity not allowed')
        }
        io.to('users').emit('message', generateMsg(msg))
        callback()
    })

    socket.on('sendLocation', (pos, cb) => {
        io.emit('locationMsg', generateLoc(`https://google.com/maps?q=${pos.latitude},${pos.longitude}`))
        cb()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMsg('A user left'))
    })
})

server.listen(port, () => {
    console.log(`running on ${port}`)
})