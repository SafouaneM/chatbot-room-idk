//todo split it up files o_O
import fetch from '/node-fetch'
const socket = io();
import dotenv from '/dotenv'
dotenv.config()
const apiKey = process.env.GIPHY_KEY;

const registerForm = document.getElementById('register-form');
const chatForm = document.getElementById('chat-form');
const privateMessageForm = document.getElementById('private-message-form');
const usernameInput = document.getElementById('username-input');
const chatInput = document.getElementById('chat-input');
const privateMessageInput = document.getElementById('private-message-input');
const chatMessages = document.getElementById('chat-messages');
const privateMessages = document.getElementById('private-messages');
const userList = document.getElementById('user-list');

let username = '';


registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (usernameInput.value.trim()) {
        socket.emit('register user', usernameInput.value);
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (chatInput.value.trim()) {
        const message = chatInput.value;

        if (message.startsWith('/giphy ')) {
            const searchTerm = message.slice(7);
            try {
                const response = await fetch('https://api.giphy.com/v1/gifs/search', {
                    params: {
                        api_key: apiKey,
                        q: searchTerm,
                        limit: 1,
                    },
                });

                const gifUrl = response.data.data[0]?.images?.fixed_height?.url;
                if (gifUrl) {
                    socket.emit('chat message', { username, message: gifUrl });
                } else {
                    socket.emit('chat message', { username, message: 'No GIF found.' });
                }
            } catch (error) {
                console.error('Error searching for GIF:', error);
                socket.emit('chat message', { username, message: 'Error searching for GIF.' });
            }
        } else {
            socket.emit('chat message', { username, message });
        }

        chatInput.value = '';
    }
});

privateMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (privateMessageInput.value.trim()) {
        socket.emit('private message', {
            to: userList.value,
            from: username,
            message: privateMessageInput.value,
        });
        privateMessageInput.value = '';
    }
});

chatInput.addEventListener()

socket.on('register success', (registeredUsername) => {
    username = registeredUsername;
    localStorage.setItem('username', registeredUsername);
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('chat-section').classList.remove('hidden');
});

socket.on('register failed', (msg) => {
    alert(msg);
});

socket.on('register failed', (msg) => {
    alert(msg);
});

chatInput.addEventListener('input', () => {
    socket.emit('user typing', { username });
});

chatInput.addEventListener('blur', () => {
    socket.emit('user stopped typing', { username });
});

socket.on('chat message', (data) => {
    const { username, message } = data;
    const messageElement = document.createElement('div');
    messageElement.textContent = `${username}: ${message}`;
    messageElement.classList.add('my-2', 'p-2', 'bg-gray-200', 'rounded');
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('private message', (data) => {
    const { from, message } = data;
    const messageElement = document.createElement('div');
    messageElement.textContent = `From ${from}: ${message}`;
    messageElement.classList.add('my-2', 'p-2', 'bg-yellow-200', 'rounded');
    privateMessages.appendChild(messageElement);
    privateMessages.scrollTop = privateMessages.scrollHeight;
});



socket.on('user connected', (newUser) => {
    const userElement = document.createElement('option');
    userElement.value = newUser;
    userElement.textContent = newUser;
    userList.appendChild(userElement);
});

socket.on('user disconnected', (disconnectedUser) => {
    const userElement = Array.from(userList.options).find(
        (option) => option.value === disconnectedUser
    );
    if (userElement) {
        userList.removeChild(userElement);
    }
});

socket.on('user typing', (data) => {
    const { typingUsername } = data;
    if (typingUsername !== username) {
        document.getElementById('typing-status').textContent = `${typingUsername} is typing...`;
    }
});

socket.on('user stopped typing', (data) => {
    const { typingUsername } = data;
    if (typingUsername !== username) {
        document.getElementById('typing-status').textContent = '';
    }
});

socket.on('user typing', (data) => {
    const { username } = data;
    socket.broadcast.emit('user typing', { username });
});

socket.on('user stopped typing', (data) => {
    const { username } = data;
    socket.broadcast.emit('user stopped typing', { username });
});

document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        socket.emit('register user', storedUsername);
    }
});
