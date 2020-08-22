class SocketServer {
    io = null
    connections = {}

    init(io) {

        this.io = io

        io.on('connection', socket => {

            socket.on('add user', data => {

                this.connections[data._id] = socket

            })

        })

    }

    send(user_id, { message, data }) {

        this.connections[user_id].emit(message, data)

    }

    broadcast(receivers, data) {

        receivers.forEach(user_id => {

            this.send(user_id, data)

        });
    }

    get socket(user_id) {
        return this.connections[user_id] 
    }
}

const socketServer = new SocketServer()
export default socketServer

