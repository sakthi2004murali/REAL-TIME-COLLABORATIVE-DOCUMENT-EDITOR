// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/realtimedocs');

// Document Schema
const Document = mongoose.model('Document', new mongoose.Schema({
    _id: String,
    content: String,
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", socket => {
    console.log("New client connected:", socket.id);

    socket.on("get-document", async documentId => {
        let document = await Document.findById(documentId);
        if (!document) {
            document = await Document.create({ _id: documentId, content: "" });
        }

        socket.join(documentId);
        socket.emit("load-document", document.content);

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { content: data });
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));
