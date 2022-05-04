import { renderMessages, renderChannels } from './utils.js'
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

export const loadMessages = () => {
    
    const currentChannel = localStorage.getItem('current-channel');
    const joinChannel = `${currentChannel} join`;
    
    socket.emit('join channel', currentChannel)
    
    socket.on(joinChannel, (data) => {
        console.log(socket.listeners(joinChannel))
        console.log(data)
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

export const loadChannel = () => {
    socket.emit('channels list')
    socket.on('channels list', (data) => {
        renderChannels(Object.entries(data))
    });
}

export const createChannel = (channel) => {
    socket.emit('create channel', channel);

    socket.on('channel created', (data) => {
        console.log(data);
    });
}
