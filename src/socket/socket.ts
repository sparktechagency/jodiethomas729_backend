import { Server, Socket } from 'socket.io';
// import { handleNotification } from '../app/modules/notification/notification.service'; 
import { ENUM_SOCKET_EVENT } from '../enums/user';
import { handleMessageData } from '../app/modules/messages/message.socket';
import Auth from '../app/modules/auth/auth.model';

// Set to keep track of online users
const onlineUsers = new Set<string>();

const socket = (io: Server) => {
  io.on(ENUM_SOCKET_EVENT.CONNECT, async (socket: Socket) => {
    const currentUserId = socket.handshake.query.id as string;
    // const role = socket.handshake.query.role as string;

    const checkDb = await Auth.findById(currentUserId)
    if (!checkDb) {
      socket.emit("error", { message: "The user not exist in our app!" });
      return;
    }

    socket.join(currentUserId);
    console.log("A user connected", currentUserId);

    // Add the user to the online users set
    onlineUsers.add(currentUserId);
    io.emit("onlineUser", Array.from(onlineUsers));

    // Handle message events
    await handleMessageData(currentUserId, socket, io);

    // Handle notifications events
    // await handleNotification(currentUserId, role, socket, io); 

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected", currentUserId);
      onlineUsers.delete(currentUserId);
      io.emit("onlineUser", Array.from(onlineUsers));
    });
  });
};

// Export the socket initialization function
export default socket;
