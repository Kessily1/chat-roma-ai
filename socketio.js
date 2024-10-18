const express = require('express')
const httpt = require('http')
const socketio = require('socket.io')

const app = express()
const server = httpt.createServer(app)
const io = socketio(server)

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('usuario conectado' + socket.id)

  socket.on('message', (msg) => {
    console.log (msg)
    io.emit('message', msg)
  })
})

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/chat.html")
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

//aqui vai o socketio

server.listen(3000)






//e para excluironvjdnsiaodbnvoisdbuvujb sdvaaaaaaaaaaaaaaaaaads