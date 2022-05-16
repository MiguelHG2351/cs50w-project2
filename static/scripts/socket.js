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

    socket.on('channels list', (data) => {
        renderChannels(Object.entries(data))
    });
}

export const loadMessages = () => {
    
    const currentChannel = localStorage.getItem('current-channel');
    const joinChannel = `${currentChannel} join-load`;
    
    socket.emit('join channel', currentChannel)
    
    socket.on(joinChannel, (data) => {
        console.log(socket.listeners(joinChannel))
        console.log(data.messages)
        renderMessages(data.messages)
    });
}

export const sendMessage = (message, image = null) => {
    const currentChannel = localStorage.getItem('current-channel');
    const formData = new FormData();
    formData.append('message', message);
    formData.append('channel_name', currentChannel);
    if(image) {
        formData.append('image', image);
    }

    fetch('/send_message', {
        method: 'POST',
        body: formData
    }).then(data => data.json())
    .then(data => {
        console.log(data)
    })

    // socket.emit('send message', currentChannel, message);
}

export const loadChannel = () => {
    socket.emit('channels list')
}

export const createChannel = (channel) => {
    socket.emit('create channel', channel);

    socket.on('channel created', (data) => {
        console.log(data);
    });
}
