const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

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

    socket.on('sendMessage', (msg)=> {
        io.emit('message', msg)
    })
})

server.listen(port, () => {
    console.log(`running on ${port}`)
})