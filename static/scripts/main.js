import './events.js';

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

customElements.define('message-card', MessageCard);

// const socket = io()
