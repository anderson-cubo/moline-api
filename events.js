module.exports = function (socket) {
  socket.on('join', function (room) {
    socket.join(room)
  })
  socket.on('leave', function (room) {
    socket.leave(room)
  })
  socket.on('message', function (room, message) {
    socket.to(room).emit(message)
  })
}
