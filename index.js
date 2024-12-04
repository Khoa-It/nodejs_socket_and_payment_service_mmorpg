const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // Import thư viện CORS


const os = require('os');
const { addData, confirmPayment, gamePakage } = require("./payment");
const { GameServer } = require("./game_server");

const networkInterfaces = os.networkInterfaces();

const getIpAdress = () => {
    for (const [key, addresses] of Object.entries(networkInterfaces)) {
        if(key != 'Wi-Fi') continue;
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                console.log(`Địa chỉ IP của máy: ${address.address}`);
                return address.address;
            }
        }
    }
    return null;
}



const app = express();
const server = http.createServer(app);
const gameServerFrontEnd = {
    cors: {
        origin: "*", // Địa chỉ frontend
        methods: ["GET", "POST"],       // Các phương thức HTTP được phép
    },
}
const io = new Server(server, gameServerFrontEnd);

app.use(cors());

app.use(express.json()); // Middleware để parse JSON body


// API route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Route để nhận dữ liệu từ Android
app.post('/notifications', (req, res) => {
    const { notification } = req.body;  // Lấy dữ liệu JSON từ request
    console.log('Received notification:', notification);  // Log dữ liệu nhận được
    const result = addData(notification);
    if (result) {
        res.status(200).send('Transaction stored successfull !');  // Phản hồi lại cho client
    } else {
        res.status(200).send('Transaction dont stored because it same the other !');  // Phản hồi lại cho client
    }
});


app.post('/payment', (req, res) => {
    const param = req.body;
    const calback_res = confirmPayment(param);
    const mes = calback_res ? 'Xử lý thành công' : 'Xử lý thất bại';
    const item_recived = {
        mora : calback_res ? gamePakage[param.package].mora : 0,
    }
    const result = {
        message: mes,
        data: param,
        ...item_recived,
    };
    res.status(200).send(JSON.stringify(result));
})

const gameServer = new GameServer();
const event = {
    connect: "connect",
    disconnect: "disconnect",
    welcome: "welcome",
    addNewPlayer: "addNewPlayer",
    updatePlayerList: "updatePlayerList",
    serverRequestAddFriend: "serverRequestAddFriend",
    clientRequestAddFriend: "clientRequestAddFriend",
    serverMessage: "serverMessage",
    clientMessage: "clientMessage",
    serverUpdateMessage: "serverUpdateMessage",
    clientUpdateMessage: "clientUpdateMessage",
}

const mapping = {};
const messages = {};

// Socket.IO setup
io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);
    socket.emit("welcome", { message: "Welcome to the server!" });
    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });

    socket.on(event.addNewPlayer, (param) => {
        console.log('param from client: ',param);
        gameServer.addPlayer(param);
        mapping[param.user_id] = param.socket_id;
        io.emit(event.updatePlayerList, gameServer.getPlayerId());
    })

    socket.on(event.serverRequestAddFriend, (param) => {
        console.log('param from client: ',param);
        socket.broadcast.emit(event.clientRequestAddFriend,param);
    })

    socket.on(event.serverMessage, (param) => {
        console.log('param from client: ',param);
        if( !(param.chat_room in messages) ) messages[param.chat_room] = [];
        messages[param.chat_room].push(param);
        io.to(mapping[param.reciver]).emit(event.clientMessage, messages[param.chat_room]);
        socket.emit(event.clientMessage,messages[param.chat_room]);
    })

    socket.on(event.serverUpdateMessage, (param) => {
        if(param.chat_room in messages) {
            socket.emit(event.clientUpdateMessage, messages[param.chat_room]);
        }
    })
});






// Start the server
const PORT = 3030;
const IP = getIpAdress();
const localhost = "localhost";
const DOMAIN = IP ?? localhost;
server.listen(PORT, () => {
    console.log(`Server is running on http://${DOMAIN}:${PORT}`);
});
