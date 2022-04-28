import 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.0/socket.io.js';

const socket = io();

// io.on('message', (message) => {
//     console.log('New message: ', message);
// });
export const loadSocket = () => {
    socket.on('connect', () => {
        console.log('Connected to server');
    });
}

function renderMessages(messages) {
    const $messageList = document.querySelector('#message-list');
    $messageList.innerHTML = '';

    for(const message of messages) {
        const messageCard = document.createElement('message-card')
        messageCard.setAttribute('author', message.author)
        messageCard.setAttribute('message', message.message)
        messageCard.setAttribute('date', message.timestamp)

        $messageList.appendChild(messageCard)
    }
}

export const loadMessages = () => {
    
    const currentChannel = localStorage.getItem('current-channel');
    const joinChannel = `${currentChannel} join`;
    
    socket.emit('join channel', currentChannel)
    socket.on(joinChannel, (data) => {
        renderMessages(data.messages)
    });
}

export const sendMessage = (message) => {
    const currentChannel = localStorage.getItem('current-channel');
    const joinChannel = `${currentChannel} messages`;
    
    console.log(joinChannel);
    socket.emit('send message', currentChannel, message);

    socket.on(joinChannel, (data) => {
        renderMessages(data.messages)
    });
}

