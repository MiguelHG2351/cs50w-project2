const $messagesContainer = document.querySelector('#messages-container');
const $closeMessages = document.querySelector('#close-messages');
const $channel = document.querySelector('#channel');

$channel.addEventListener('click', function () {  
    if(!$messagesContainer.classList.contains('active')) {
        $messagesContainer.classList.add('active');
    }
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
