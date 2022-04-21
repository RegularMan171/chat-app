const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMsg, generateLoc} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

let count = 0

io.on('connection', (socket) => {
    console.log('new connection')
    socket.on('join', ({username, room}, cb) => {
        const {error, user} = addUser({id: socket.id, username, room})
        if(error) {
            return cb(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMsg("Admin",'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMsg(user.username,`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsers(user.room)
        })
        cb()
    })

    socket.on('sendMessage', (msg, callback)=> {
        const filter = new Filter()
        if(filter.isProfane(msg)) {
            return callback('Profanity not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMsg(user.username,msg))
        callback()
    })

    socket.on('sendLocation', (pos, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMsg', generateLoc(user.username, `https://google.com/maps?q=${pos.latitude},${pos.longitude}`))
        cb()
    })

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id)
        if(removedUser) {
            io.to(removedUser.room).emit('message', generateMsg("Admin", `${removedUser.username} has left`))
            io.to(removedUser.room).emit('roomData', {
                room: removedUser.room,
                users: getUsers(removedUser.room)
            })    
        }
    })
})

server.listen(port, () => {
    console.log(`running on ${port}`)
})