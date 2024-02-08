import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Messages")
  }

  async gerRoomCards(rooms) {
    let content = ''

    for (const room of rooms) {
      content += ChatComponents.sidebarMessage(
        {'id': (room.id || ''),'active': false, 'messageText': '', 'username': room.participants[0], 'sentDate': ''}
      )
    }

    return content
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    document.getElementById('footer').classList.add('d-none')

    const rooms = await new httpRequest({resource: '/chat/api/rooms/get', method: 'GET', successCallback: response => {
        return response
    }}).send()

    const content = `
    <div class="row overflow-hidden px-3">
      <div class="col-2 px-0">
        <div class="px-3 py-2 bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded me-1">
          <p class="h5 mb-0 py-1">Chats</p>
        </div>
        <div class="messages-box rounded">
          <div class="list-group">
            ${await this.gerRoomCards(rooms['data'] || [])}
          </div>
        </div>
      </div>

      <div class="col-10 px-0">
        <div class="px-4 py-2 bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded">
          <p class="h5 mb-0 py-1">Username</p>
        </div>

        <div class="px-2 py-4 chat-box bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded">
          ${ChatComponents.senderMessage({'messageText': 'Lorem ipsum dolor sit amet, consectetur. incididunt ut labore.', 'sentDateTime': '09:12 AM | Fab 2'})}
          ${ChatComponents.recieverMessage({'messageText': 'Lorem ipsum dolor sit amet, consectetur. incididunt ut labore.', 'sentDateTime': '09:12 AM | Fab 2'})}
        </div>

        <form action="#" class="bg-body-tertiary bg-opacity-50 rounded">
          <div class="input-group">
            <input type="text" placeholder="Type a message" class="form-control rounded">
            <div class="input-group-append">
              <button type="submit" class="btn btn-link border"> <i class="bi bi-send"></i></button>
            </div>
          </div>
        </form>
      </div>
    </div>
    `

    return content
  }
}