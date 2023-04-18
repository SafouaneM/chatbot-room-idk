//todo split it up files o_O
const socket = io();



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
            const searchTerm = message.slice(7)
            socket.emit('giphy search', {searchTerm, username})
        }
        else {
            socket.emit('chat message', {username, message})
        }
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
    messageElement.classList.add('my-2', 'p-2', 'bg-gray-200', 'rounded');

    if (message.startsWith('http') && (message.includes('.gif') || message.includes('.GIF'))) {
        const img = document.createElement('img');
        img.src = message;
        img.alt = 'GIF';
        messageElement.innerHTML = `${username}: `;
        messageElement.appendChild(img);
    } else {
        messageElement.textContent = `${username}: ${message}`;
    }   

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
