import { channelHandler } from './events.js'

export const isAutenticated = async function () {
    const user = await fetch('/auth')
    const response = await user.json()
    console.log(response.success)

    return response.success
}

export const mutationObserver = async function (mutationList, observer) {
    if(mutationList.length > 0) {
        window.location.reload()
    }
}


const DATE_UNITS = {
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  }
  
  const getSecondsDiff = timestamp => (Date.now() - timestamp) / 1000
  const getUnitAndValueDate = (secondsElapsed) => {
    for (const [unit, secondsInUnit] of Object.entries(DATE_UNITS)) {
      if (secondsElapsed >= secondsInUnit || unit === "second") {
        const value = Math.floor(secondsElapsed / secondsInUnit) * -1
        return { value, unit }
      }
    }
  }
  
export const getTimeAgo = timestamp => {
    const rtf = new Intl.RelativeTimeFormat()
  
    const secondsElapsed = getSecondsDiff(timestamp)
    const {value, unit} = getUnitAndValueDate(secondsElapsed)
    return rtf.format(value, unit)
}

export const renderMessages = function (messages) {
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

export const renderChannels = function (channels) {
  const $messageList = document.querySelector('.channels');
  $messageList.innerHTML = '';
  
  console.log('render')
  for(const [name, info] of channels) {
    const lastMessage = info.messages.length > 0 ? info.messages[info.messages.length - 1].message : ''
    const date = info.messages.length > 0 ? info.messages[info.messages.length - 1].timestamp : ''
    console.log(info)
    const image = info.image.url

      const channelItem = document.createElement('channel-item')
      channelItem.classList.add('channel')
      // Hay que agregar un evento
      // con getEventListeners(channelItem) puedo saber si el elemento tiene un evento
      channelItem.addEventListener('click', channelHandler)
      channelItem.setAttribute('channelName', name)
      channelItem.setAttribute('lastMessage', lastMessage)
      channelItem.setAttribute('image', image)
      channelItem.setAttribute('date', date)

      $messageList.appendChild(channelItem)
  }
}