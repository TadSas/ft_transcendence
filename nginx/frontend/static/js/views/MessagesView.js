import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Messages")

    document.getElementById('nav-messages').querySelector('.sidebar-icon-notification').classList.add('d-none')
  }

  async gerRoomCards(rooms) {
    let content = ''

    for (const room of rooms) {
      const roomId = room.id || ''
      const activity = room['activity'] || {}

      content += ChatComponents.sidebarMessage(
        {
          'id': roomId,
          'active': false,
          'messageText': activity['message'],
          'username': room.participants.join(''),
          'sentDate': activity['sent_date'],
          'onclick': `MessagesController.startChatting('${encodeURIComponent(JSON.stringify(room))}')`
        }
      )
    }

    return content
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    document.getElementById('footer').classList.add('d-none')

    const rooms = await new httpRequest({resource: '/chat/api/rooms/list', method: 'GET', successCallback: response => {
      return response
    }}).send()

    const content = `
    <div class="row overflow-hidden mx-0">
      <div class="col-2 px-0">
        <div class="px-3 py-2 bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded me-1">
          <p class="h5 mb-0 py-1">Chats</p>
        </div>
        <div class="messages-box rounded">
          <div id="side-message-cards" class="list-group">
            ${await this.gerRoomCards((rooms || {})['data'] || [])}
          </div>
        </div>
      </div>

      <div class="col-10 px-0">
        <div class="px-4 py-2 d-flex align-items-center bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded">
          <a href="" id="chatHeader" class="d-flex align-items-center link-body-emphasis text-decoration-none invisible" data-link>
            <i class="bi bi-person-circle pe-none me-2 mb-0 h6"></i>
            <p class="h5 mb-0 py-1 me-4 pe-none"></p>
          </a>

          <div id="chatUserBlockToggle" role="button" class="d-flex align-items-center link-body-emphasis text-decoration-none invisible">
            <i class="bi bi-ban pe-none me-2 mb-0 h6"></i>
            <p class="h5 mb-0 py-1 me-4 pe-none"></p>
          </div>

          <a href="/pong" id="chatPongInvite" class="d-flex align-items-center link-body-emphasis text-decoration-none invisible" data-link>
            <i class="bi bi-rocket-takeoff pe-none me-2 mb-0 h6"></i>
            <p class="h5 mb-0 py-1 me-4 pe-none">Play Pong</p>
          </a>
        </div>

        <div id="messageContainer" class="px-2 py-4 vh-80 overflow-x-scroll bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded">
          <div class="d-flex justify-content-center align-items-center h-100">
            <span class="badge border border-secondary rounded-pill text-secondary">
              Select a chat to start messaging
            </span>
          </div>
        </div>

        <form id="messageForm" action="#" class="bg-body-tertiary bg-opacity-50 rounded" onsubmit="MessagesController.sendMessage(event); return false">
          <div class="input-group">
            <input id="messageInputArea" type="text" placeholder="Type a message" class="form-control rounded d-none">
            <div class="input-group-append">
              <button id="messageInputButton" type="submit" class="btn btn-link border d-none">
                <i class="bi bi-send"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    `
    return content
  }
}