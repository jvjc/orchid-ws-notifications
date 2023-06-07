export default class extends window.Controller {
    static targets = ["status"]
    static values = { endpoint: String }

    triggerEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail
        })
        document.querySelector('body').dispatchEvent(event)
    }

    showToast(config = {}) {
        const toastHeader = `<div class="toast-header">
            <strong class="me-auto">${config.title}</strong>
            ${config.subtitle ? '<small>' + config.subtitle + '</small>': ''}
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>`

        const toastBody = `<div class="toast-body">${config.message}</div>`

        const themes = {
            primary: 'bg-primary text-white',
            secondary: 'bg-secondary text-white',
            success: 'bg-success text-white',
            danger: 'bg-danger text-white',
            warning: 'bg-warning text-white',
            info: 'bg-info text-white',
            light: 'bg-light text-dark',
            dark: 'bg-dark text-white',
        }

        const container = document.createElement('div')
        container.setAttribute('class', `toast m-3 ${themes[config.theme]}`)
        container.classList.add()
        container.setAttribute('role', 'alert')
        container.setAttribute('aria-live', 'assertive')
        container.setAttribute('aria-atomic', 'true')

        container.innerHTML = toastHeader + toastBody

        if (config.buttons && config.buttons.length > 0) {
            const toastActions = document.createElement('div')
            toastActions.setAttribute('class', 'mt-2 pt-2 border-top d-flex')

            config.buttons.forEach(payload => {
                const buttonElement = document.createElement('button')
                buttonElement.setAttribute('type', 'button')
                buttonElement.setAttribute('class', `btn btn-${payload.theme} btn-sm me-1`)

                if (payload.action === 'link') {
                    buttonElement.onclick = () => {
                        window.location.href = payload.url
                    }
                } else if (payload.action === 'event') {
                    buttonElement.onclick = () => {
                        this.triggerEvent(payload.event, payload.detail)
                    }
                }

                buttonElement.textContent = payload.text

                toastActions.append(buttonElement)
            })

            container.querySelector('.toast-body').append(toastActions)
        }

        document.querySelector('.toast-wrapper').append(container)

        const toast = new Bootstrap.Toast(container, {
            autohide: config.autohide,
            delay: config.delay || 5000
        })

        container.addEventListener('hidden.bs.toast', () => {
            container.remove()
        })

        toast.show()
    }

    connect() {
        this.connectWebSocket()
        this.startKeepAlive()
    }

    disconnect() {
        this.stopKeepAlive()
        this.disconnectWebSocket()
    }

    connectWebSocket() {
        this.websocket = new WebSocket(this.endpointValue)

        this.websocket.onmessage = (event) => {
            // Handle received messages here
            try {
                const { type, payload } = JSON.parse(event.data)

                if (type === 'notification') {
                    this.showToast(payload)
                } else if (type === 'event') {
                    this.triggerEvent(payload.name, payload.detail)
                }
            } catch (e) {}
        }

        this.websocket.onclose = () => {
            this.reconnectWebSocket()
        }
    }

    reconnectWebSocket() {
        setTimeout(() => {
            this.connectWebSocket()
        }, 5000) // 5 seconds delay, adjust as needed
    }

    disconnectWebSocket() {
        if (this.websocket) {
            this.websocket.close()
        }
    }

    startKeepAlive() {
        this.keepAliveInterval = setInterval(() => {
            if (this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send("keep-alive") // Send a keep-alive message
            }
        }, 30000) // 30 seconds interval, adjust as needed
    }

    stopKeepAlive() {
        clearInterval(this.keepAliveInterval)
    }
}
