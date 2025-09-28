const Message = require('./models/Message.js');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('joinChat', async (data) => {
      const { senderId, recipientId } = data;
      const roomName = [senderId, recipientId].sort().join('-');
      socket.join(roomName);
      console.log(`User ${senderId} joined room ${roomName}`);

      const messages = await Message.find({
        $or: [
          { sender: senderId, recipient: recipientId },
          { sender: recipientId, recipient: senderId }
        ]
      }).sort({ createdAt: 1 });

      socket.emit('chatHistory', messages);
    });

    socket.on('sendMessage', async (data) => {
      const { senderId, recipientId, senderRole, recipientRole, messageText } = data;
      const roomName = [senderId, recipientId].sort().join('-');

      const newMessage = new Message({
        sender: senderId,
        senderModel: senderRole,
        recipient: recipientId,
        recipientModel: recipientRole,
        messageText,
      });
      await newMessage.save();

      io.to(roomName).emit('receiveMessage', newMessage);
    });
  });
};