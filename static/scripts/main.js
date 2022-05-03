import './events.js';
import { getTimeAgo } from './utils.js'

class MessageCard extends HTMLElement {
    getTemplate() {
        const author = this.getAttribute('author');
        const message = this.getAttribute('message');
        let getDate = this.getAttribute('date');
        getDate = Intl.DateTimeFormat('en-US', {hour: 'numeric', minute: 'numeric'}).format(new Date(getDate*1000));

        const template = document.createElement('template');
        template.innerHTML = `
            <div class="message-author">
                <span>${author}</span>
            </div>
            <div class="message-data">
                <p>${message}</p>
                <span class="padding"></span>
            </div>
            <time>${getDate}</time>
        `

        return template;
    }

    render() {
        this.appendChild(this.getTemplate().content.cloneNode(true));
        this.classList.add('message')
    }
    
    connectedCallback() {
        this.render();
    }
}

class ChannelItem extends HTMLElement {
    getTemplate() {
        const channelName = this.getAttribute('channelName');
        const lastMessage = this.getAttribute('lastMessage');
        const image = this.getAttribute('image');
        const getDate = this.getAttribute('date');

        let timeAgo = ''
        let fullDate = '';
        
        if (getDate.length > 0) {
            timeAgo = getTimeAgo(getDate * 1000);
            fullDate = Intl.DateTimeFormat('en-US').format(getDate)
        }

        const template = document.createElement('template');
        template.innerHTML = `
            <div class="channel-image">
                <img src="${image}" height="48" alt="platzi">
            </div>
            <div class="channel-info">
                <div class="channel-info-intro">
                    <div class="last-message">
                        <h3>${channelName}</h3>
                        <time datetime="${fullDate}">${timeAgo}</time>
                    </div>
                    <p>${lastMessage}</p>
                </div>
            </div>
        `

        return template;
    }

    render() {
        this.appendChild(this.getTemplate().content.cloneNode(true));
    }
    
    connectedCallback() {
        this.render();
    }
}

customElements.define('message-card', MessageCard);
customElements.define('channel-item', ChannelItem);

// const socket = io()
