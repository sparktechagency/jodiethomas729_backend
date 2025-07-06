import { ENUM_SOCKET_EVENT } from "../../../enums/user";
import ApiError from "../../../errors/ApiError";
import Auth from "../auth/auth.model";
import Conversation from "./conversation.model";
import Message from "./message.model";
import mongoose from "mongoose";


const handleMessageData = async (
    senderId: any,
    socket: any,
    onlineUsers: any,
): Promise<void> => {
    // Get Conversation All Messages
    socket.on(ENUM_SOCKET_EVENT.MESSAGE_GETALL, async (data: {
        receiverId: string,
        page: number,
    }) => {
        const { receiverId, page } = data as any;

        if (!receiverId) {
            socket.emit('error', {
                message: 'SenderId not found!',
            });
            return;
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            orderId: null
        })
            .populate({
                path: 'messages',
                options: {
                    sort: { createdAt: -1 },
                    skip: (page - 1) * 20,
                    limit: 20,
                },
                populate: [
                    { path: 'senderId', select: 'name email profile_image' },
                    { path: 'receiverId', select: 'name email profile_image' }
                ]
            });
        // receiverId

        if (conversation) {
            await emitMessage(senderId, conversation, `${ENUM_SOCKET_EVENT.MESSAGE_GETALL}/${receiverId}`)
        }
    },
    );

    // Send Message for Email
    socket.on(ENUM_SOCKET_EVENT.MESSAGE_NEW, async (data: { receiverId: string; text: string }) => {
        const { receiverId, text } = data;

        if (!receiverId || !text) {
            socket.emit("error", { message: "ReceiverId or text is missing!" });
            return;
        }

        // console.log("=========", receiverId, text)

        let conversation = await Conversation.findOne({
            participants: { $all: [receiverId, senderId] },
        });

        if (!conversation) {
            const checkDb = await Auth.findById(receiverId)
            if (!checkDb) {
                socket.emit("error", { message: "The receiver user not exist in our app!" });
                return;
            }

            conversation = await Conversation.create({
                participants: [receiverId, senderId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message: text,
            conversationId: conversation._id,
        });

        conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()]);

        // ==========================
        const messages = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            orderId: null
        })
            .populate({
                path: 'messages',
                // options: {
                //     sort: { createdAt: -1 },
                //     skip: (page - 1) * 20,
                //     limit: 20,
                // },
                populate: [
                    { path: 'senderId', select: 'name email profile_image' },
                    { path: 'receiverId', select: 'name email profile_image' }
                ]
            });

        if (messages) {
            await emitMessage(senderId, messages, ENUM_SOCKET_EVENT.MESSAGE_GETALL)
        }

        // =========================== 
        await emitMessage(senderId, newMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW}/${receiverId}`);
        await emitMessage(receiverId, newMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW}/${senderId}`);
    });

    // Get Conversation List
    socket.on(ENUM_SOCKET_EVENT.CONVERSION, async () => {
        try {

            const conversations = await Conversation.find({
                participants: { $in: [senderId] },
                orderId: null,
            })
                .populate({
                    path: 'participants',
                    select: 'name email profile_image',
                })
                .populate({
                    path: 'messages',
                    // options: { sort: { createdAt: -1 }, limit: 1 },
                })
                .sort({ updatedAt: -1 });


            await emitMessage(senderId, conversations, ENUM_SOCKET_EVENT.CONVERSION);

        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    });
};

// Emit a message to a user
const emitMessage = (receiver: string, data: any, emitEvent: string): void => {
    //@ts-ignore
    const socketIo = global.io;
    if (socketIo) {
        socketIo.to(receiver).emit(emitEvent, data);
    } else {
        console.error("Socket.IO is not initialized");
    }
};

export { handleMessageData, emitMessage };



// Get Order All Messages
//    socket.on(ENUM_SOCKET_EVENT.MESSAGE_GETALL, async (data: {
//     orderid: string,
//     page: number,
// }) => {
//     const { orderId, page } = data as any;

//     if (!senderId) {
//         socket.emit('error', {
//             message: 'SenderId not found!',
//         });
//         return;
//     }

//     const conversation = await Conversation.findOne({
//         orderId
//     }).populate({
//         path: 'messages',
//         populate: {
//             path: 'senderId',
//             select: 'name email profile_image',
//         },
//         options: {
//             sort: { createdAt: -1 },
//             skip: (page - 1) * 20,
//             limit: 20,
//         },
//     });

//     if (!conversation) {
//         return 'Conversation not found';
//     }

//     if (conversation) {
//         await emitMessage(senderId, conversation, ENUM_SOCKET_EVENT.MESSAGE_GETALL)
//     }
// },
// );