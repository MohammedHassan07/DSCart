import { Server } from "socket.io";

let io;

const initSocket = (httpServer) => {

    if (io) return io;

    // new Server(httpServer, option); e.g. option = { cors: { origin: '*' } }
    io = new Server(httpServer);
    return io;
}

const getIo = () => {

    if (!io) {
        throw new Error("Socket.IO not initialised. Call initSocket(httpServer) first.");
    }
    return io
}

export default {
    initSocket,
    getIo
}