import 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.0/socket.io.js';

const socket = io();

// io.on('message', (message) => {
//     console.log('New message: ', message);
// });
const currentChannel = localStorage.getItem('current-channel');
export const loadSocket = () => {
    socket.on('connect', () => {
        console.log('Connected to server');

        socket.emit('join channel', currentChannel)
    });    
}

export const loadMessage = () => {
    socket.on(currentChannel, (data, other) => {
        console.log('Incoming data: ');
        console.log(data);
        console.log(other);
    });    
}
