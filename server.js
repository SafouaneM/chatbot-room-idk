import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

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





