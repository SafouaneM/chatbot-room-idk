import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import fetch from "node-fetch"
import dotenv from "dotenv"
dotenv.config()


const users = {};

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3100;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {

    socket.on('user typing', (data) => {
        const { username } = data;
        socket.broadcast.emit('user typing', { username });
    });

    socket.on('user stopped typing', (data) => {
        const { username } = data;
        socket.broadcast.emit('user stopped typing', { username });
    });

    console.log('The blueteeth dewive is rewdy to paaihr');
    socket.on('register user', (username) => {
        if (users[username]) {
            socket.emit('register failed', 'This username is already taken.');
        } else {
            users[username] = socket.id;
            socket.emit('register success', username);
            io.emit('user connected', username);
            console.log('The blueteeth dewive is conektido succesvully');

        }
    });

    socket.on('giphy search', async (data) => {
        const { searchTerm, username } = data;
        const apiKey = process.env.GIPHY_KEY;

        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchTerm}&limit=1`);
            const jsonResponse = await response.json();
            const gifUrl = jsonResponse.data[0]?.images?.fixed_height?.url;

            if (gifUrl) {
                io.emit('chat message', { username, message: gifUrl });
            } else {
                io.emit('chat message', { username, message: 'No GIF found.' });
            }
        } catch (error) {
            console.error('Error searching for GIF:', error);
            io.emit('chat message', { username, message: 'Error searching for GIF.' });
        }
    });

    socket.on('chat message', (data) => {
        const { username, message } = data;
        io.emit('chat message', { username, message });
    });

    socket.on('private message', (data) => {
        const { to, from, message } = data;
        const toSocketId = users[to];
        if (toSocketId) {
            io.to(toSocketId).emit('private message', { from, message });
        } else {
            socket.emit('private message failed', 'User not found.');
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        const username = Object.keys(users).find(key => users[key] === socket.id);
        if (username) {
            delete users[username];
            io.emit('user disconnected', username);
        }
    });
});


server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});





