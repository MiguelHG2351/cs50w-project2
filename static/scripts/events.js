import { isAutenticated, mutationObserver } from './utils.js'
import { loadMessages, sendMessage, loadSocket } from './socket.js'

const $messagesContainer = document.querySelector('#messages-container');
const $closeMessages = document.querySelector('#close-messages');
const $channelList = document.querySelectorAll('.channel');

// buttons
const $btnSendMessage = document.querySelector('#btn-send-message');
const $btnCreateChannel = document.querySelector('#btn-create-channel');
const $closeModal = document.querySelector('#close-modal');

const $formMessage = document.querySelector('#form-message');
// Modals
const $overlay = document.querySelector('#overlay');
const $modalAuth = document.querySelector('#modal-auth'); // autenticarse
const $formModal = document.querySelector('#form-modal-auth'); // autenticarse
const $modalChannel = document.querySelector('#modal-channel'); // crear canal 

loadMessages()

document.addEventListener('DOMContentLoaded', async () => {
    if(await isAutenticated()) {
        loadSocket();
        console.log('User is autenticated')
    } else {
        console.log('User is not autenticated')
        $overlay.classList.add('active');
        $modalAuth.classList.add('active');
    }
})

const observer = new MutationObserver(mutationObserver)
observer.observe($modalAuth, { childList: true, subtree: true })

$channelList.forEach($channel => {
    $channel.addEventListener('click', function () {  
        const channel = this.dataset.channel;

        window.localStorage.setItem('current-channel', channel);
        if(!$messagesContainer.classList.contains('active')) {
            loadMessages();
            
            $messagesContainer.classList.add('active');
        }
    })
})

$closeMessages.addEventListener('click', function () {
    if($messagesContainer.classList.contains('active')) {
        $messagesContainer.classList.remove('active');
        $messagesContainer.classList.add('inactive');
    } else {
        $messagesContainer.classList.add('active');
        $messagesContainer.classList.remove('inactive');
    }
})

$btnCreateChannel.addEventListener('click', function () {
    $overlay.classList.add('active');
    $modalChannel.classList.add('active');
})

$closeModal.addEventListener('click', function () {
    $overlay.classList.remove('active');
    $modalChannel.classList.remove('active');
})

$formMessage.addEventListener('submit', function (e) {  
    e.preventDefault();
    console.log('submit');
    const message = $formMessage.message.value;
    if(message.length > 0) {
        sendMessage(message);
        $formMessage.message.value = '';
    }

})

$formModal.addEventListener('submit', function (e) {  
    e.preventDefault();
    const formData = new FormData(this);
    // console.log(formData.get('username'));
    fetch('/auth', {
        method: 'POST',
        body: formData
    }).then(response => {
        return response.json()
    }).then(data => {
        console.log(data)
        if(data.success) {
            $overlay.classList.remove('active');
            $modalAuth.classList.remove('active');
            window.location.reload()
        }
    })
})
