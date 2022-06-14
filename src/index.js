const express=require('express')
const path=require('path')
const http = require('http')
const socketio = require('socket.io')
const { count } = require('console')
const Filter=require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/msgs')
const { SocketAddress } = require('net')
const {  addUser, removeUser, getUser, getUsersInRoom  } = require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port = process.env.PORT || 3500
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


let m="Welcome to the OP chat app!"

io.on('connection', (socket) => {
    console.log('New Websocket connection!')
        
    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({ id:socket.id, username, room })
        
        if(error){
            return callback(error) 
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(user.username,'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, user.username +' has joined!'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('send-message', (m,callback) => {
        const user=getUser(socket.id)
        const filter=new Filter()  

        if(filter.isProfane(m)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username,m))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username + ' has left!'))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on('loc',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,'https://www.google.com/maps?q='+coords.lat+','+coords.long))
        callback('Confirmed!')
    })
    })

server.listen(port, () => {
    console.log('Server is up and running on port', port)
})