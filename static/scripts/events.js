import { isAutenticated, mutationObserver } from './utils.js'
import { loadMessages, loadChannel, sendMessage, loadSocket } from './socket.js'

// containers
const $messagesContainer = document.querySelector('#messages-container');
const $closeMessages = document.querySelector('#close-messages');
const $channelList = document.querySelectorAll('.channel');

// buttons
// const $btnSendMessage = document.querySelector('#btn-send-message'); la idea era que al precionar
const $btnCreateChannel = document.querySelector('#btn-create-channel');
const $closeModals = document.querySelectorAll('.close-modal');
const $btnAddUser = document.querySelector('#btn-add-user');

// forms
const $formMessage = document.querySelector('#form-message');
const $formModalAuth = document.querySelector('#form-auth'); // autenticarse
const $formCreateChannel = document.querySelector('#form-create-channel');
const $formAddUser = document.querySelector('#form-add-user');

// inputs
const $imageInput = document.querySelector('.add-image-input');

// Modals / overlay
const $overlay = document.querySelector('#overlay');
const $modalAuth = document.querySelector('#modal-auth'); // autenticarse
const $modalChannel = document.querySelector('#modal-channel'); // crear canal 
const $modalAddUser = document.querySelector('#modal-add-user');

// events functions
function toggleModal($modal) {
    return () => {
        $overlay.classList.toggle('active');
        $modal.classList.toggle('active');
    }
}

async function domContentLoadedHandler() {
    if(await isAutenticated()) {
        loadSocket();
        console.log('User is autenticated')
    } else {
        console.log('User is not autenticated')
        toggleModal($modalAuth)();
    }
}

export function channelHandler() {
    const channel = this.dataset.channel;

    window.localStorage.setItem('current-channel', channel);
    if(!$messagesContainer.classList.contains('active')) {
        loadMessages();
        $formMessage.message.focus();
        $messagesContainer.classList.add('active');
    }
}

function channelListHandler($channel) {
    $channel.addEventListener('click', channelHandler);
}

function closeMessagesHandler() {
    if($messagesContainer.classList.contains('active')) {
        $messagesContainer.classList.remove('active');
        $messagesContainer.classList.add('inactive');
        loadChannel();
    } else {
        $messagesContainer.classList.add('active');
        $messagesContainer.classList.remove('inactive');
    }
}

function closeModalHandler($closeModal) {
    $closeModal.addEventListener('click', toggleModal($closeModal.parentElement));
}


// -------------------- Forms ------------------------ //
function formMessageHandler(e) {  
    e.preventDefault();
    console.log('submit');
    const message = $formMessage.message.value;
    if(message.length > 0) {
        sendMessage(message);
        $formMessage.message.value = '';
    }
}

function formModalAuthHandler(e) {  
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
        } else {
            $formModalAuth.reset();
        }
    })
}

function imageInputHandler() {
    console.log('image input');
    const image = $imageInput.files[0];
    if(typeof image === 'object') {
        $imageInput.parentElement.classList.add('withFile')
        $imageInput.previousElementSibling.textContent = 'Imagen seleccionada!';
    } else {
        $imageInput.parentElement.classList.remove('withFile')
        $imageInput.previousElementSibling.textContent = 'Agregar imagen';
    }
}

function formCreateChannelHandler(e) {
    e.preventDefault();
    const channelName = $formCreateChannel.channel_name.value;
    const image = $formCreateChannel.image_channel.files[0];

    fetch('/create-channel', {
        method: 'POST',
        body: new FormData($formCreateChannel)
    }).then(data => data.json())
    .then(data => {
        console.log(data)
        if(data.success) {
            $overlay.classList.remove('active');
            $modalChannel.classList.remove('active');
            window.location.reload()
        }
    })
}

function formAddUserHandler(e) {
    e.preventDefault()
    const username = $formAddUser.username.value;
    const currentChannel = window.localStorage.getItem('current-channel');
    const formData = new FormData($formAddUser);
    formData.set('channel', currentChannel);

    fetch('/add-user', {
        method: 'POST',
        body: formData
    }).then(data => {
        return data.json()
    }).then(data => {
        console.log(data)
    })
    
}

// observer (Deprecated)
const observer = new MutationObserver(mutationObserver)
observer.observe($modalAuth, { childList: true, subtree: true })

document.addEventListener('DOMContentLoaded', domContentLoadedHandler)
$channelList.forEach(channelListHandler)

// buttons events
$closeMessages.addEventListener('click', closeMessagesHandler)

$btnCreateChannel.addEventListener('click', toggleModal($modalChannel))

$closeModals.forEach(closeModalHandler)

$btnAddUser.addEventListener('click', toggleModal($modalAddUser))

// inputs events

$imageInput.addEventListener('change', imageInputHandler)

// Forms events

$formMessage.addEventListener('submit', formMessageHandler)

$formModalAuth.addEventListener('submit', formModalAuthHandler)

$formCreateChannel.addEventListener('submit', formCreateChannelHandler)

$formAddUser.addEventListener('submit', formAddUserHandler)
