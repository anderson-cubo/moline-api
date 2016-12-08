module.exports = function (socket) {
  socket.on('join', function (room) {
    socket.join(room)
  })
  socket.on('leave', function (room) {
    socket.leave(room)
  })
  socket.on('message', function (room, message) {
    socket.to(room).emit('message', message)
  })
  socket.on('close', function (room) {
    socket.to(room).emit('close', room)
  })
  socket.on('kick', function (room, uid) {
    socket.to(room).emit('kicked', uid)
  })
}
