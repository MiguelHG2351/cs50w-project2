import { alertError } from './utils/alert.js'
import { isAutenticated, mutationObserver } from './utils.js'
import { loadMessages, loadChannel, sendMessage, loadSocket } from './socket.js'

// containers
const $messagesContainer = document.querySelector('#messages-container');
const $closeMessages = document.querySelector('#close-messages');
const $channelList = document.querySelectorAll('.channel');
const $messageOptions = document.querySelector('.message-options');
const $showImageContainer = document.querySelector('#image-message-container');

// buttons
// const $btnSendMessage = document.querySelector('#btn-send-message'); la idea era que al precionar
const $btnCreateChannel = document.querySelector('#btn-create-channel');
const $closeModals = document.querySelectorAll('.close-modal');
const $btnAddUser = document.querySelector('#btn-add-user');
const $btnClosePreviewImg = document.querySelector('.btn-close-preview-img');

// forms
const $formMessage = document.querySelector('#form-message');
const $formModalAuth = document.querySelector('#form-auth'); // autenticarse
const $formCreateChannel = document.querySelector('#form-create-channel');
const $formAddUser = document.querySelector('#form-add-user');

// inputs
const $channelImageInput = document.querySelector('.channe-image-input');
const $inputMessage = document.querySelector('.input-message')
const $inputImageMessage = document.querySelector('#input-message-image')

// Modals / overlay
const $overlay = document.querySelector('#overlay');
const $modalAuth = document.querySelector('#modal-auth'); // autenticarse
const $modalChannel = document.querySelector('#modal-channel'); // crear canal 
const $modalAddUser = document.querySelector('#modal-add-user');

// events functions

async function domContentLoadedHandler() {

    if(await isAutenticated()) {
        loadSocket();
        console.log('User is autenticated')
    } else {
        console.log('User is not autenticated')
        toggleModal($modalAuth)();
    }
}

async function keyUpScape(e) {
    const $modal = document.querySelector('.modal.active:not(#modal-auth)');
    if(e.key === 'Escape' && $modal != null) {
        toggleModal($modal)();
    }
}

function toggleModal($modal) {
    return () => {
        $overlay.classList.toggle('active');
        $modal.classList.toggle('active');

        $modal.querySelector('input[type="text"]').focus();
    }
}

export function channelHandler() {
    const channel = this.dataset.channel;

    const beforeChannel = window.localStorage.getItem('current-channel')
    let channelElement = document.querySelector(`[data-channel="${beforeChannel}"]`)
    const isDesktop = window.innerWidth > 968;
    
    if(beforeChannel && channelElement != null) {
        channelElement.classList.remove('active');
    }
    this.classList.toggle('active');
    window.localStorage.setItem('current-channel', channel);
    this.classList.add('active');
    if(!$messagesContainer.classList.contains('active') || isDesktop) {
        loadMessages();
        $formMessage.message.focus();
        $messagesContainer.classList.add('active');
    }
}

function channelListHandler($channel) {
    $channel.addEventListener('click', channelHandler);
}

// buttons functions
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

function btnClosePreviewImgHandler() {
    $showImageContainer.classList.remove('active')
    // create url image
    $showImageContainer.children[0].src = ''
    $inputMessage.value = '';
    $inputImageMessage.value = null;
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
        sendMessage(message, $formMessage.imageMessage.files[0]);
        $showImageContainer.classList.remove('active')
        $inputImageMessage.value = null;
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
    const image = $channelImageInput.files[0];
    if(typeof image === 'object') {
        $channelImageInput.parentElement.classList.add('withFile')
        $channelImageInput.previousElementSibling.textContent = 'Imagen seleccionada!';
    } else {
        $channelImageInput.parentElement.classList.remove('withFile')
        $channelImageInput.previousElementSibling.textContent = 'Agregar imagen';
    }
}

function inputMessageHandler() {
    console.log()
    if(this.value === '/') {
        $messageOptions.classList.add('active')
    } else {
        $messageOptions.classList.remove('active')
    }
}

function inputImageMessageHandler() {
    if(this.files[0]) {
        $showImageContainer.classList.add('active')
        // create url image
        const urlImage = URL.createObjectURL(this.files[0])
        $showImageContainer.children[1].setAttribute('src', urlImage)
        $inputMessage.value = '';
        $messageOptions.classList.remove('active')
    }
}

// forms function

function formCreateChannelHandler(e) {
    e.preventDefault();

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
        } else {
            alertError(data.message)
        }
    })
}

function formAddUserHandler(e) {
    e.preventDefault()
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
        if (data.success) {
            toggleModal($modalAddUser)();
            loadChannel();
            $formMessage.message.focus();
        } else {
            $formAddUser.reset();
            toggleModal($modalAddUser)();
            alertError(data.message);
            $formMessage.message.focus();
        }
    }).catch(err => console.error(err))
    
}

// observer (Deprecated)
const observer = new MutationObserver(mutationObserver)
observer.observe($modalAuth, { childList: true, subtree: true })

// global events
document.addEventListener('DOMContentLoaded', domContentLoadedHandler)
document.addEventListener('keyup', keyUpScape)

//containers
$channelList.forEach(channelListHandler)

// buttons events
$closeMessages.addEventListener('click', closeMessagesHandler)
$btnCreateChannel.addEventListener('click', toggleModal($modalChannel))
$closeModals.forEach(closeModalHandler)
$btnAddUser.addEventListener('click', toggleModal($modalAddUser))
$btnClosePreviewImg.addEventListener('click', btnClosePreviewImgHandler)
// inputs events

$channelImageInput.addEventListener('change', imageInputHandler)
$inputMessage.addEventListener('input', inputMessageHandler)
$inputImageMessage.addEventListener('change', inputImageMessageHandler)

// Forms events

$formMessage.addEventListener('submit', formMessageHandler)
$formModalAuth.addEventListener('submit', formModalAuthHandler)
$formCreateChannel.addEventListener('submit', formCreateChannelHandler)
$formAddUser.addEventListener('submit', formAddUserHandler)
