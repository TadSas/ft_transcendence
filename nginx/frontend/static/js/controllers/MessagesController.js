var MessagesController = (() => {
  var chatWebSocket
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.createRoom = (chatter) => {
    new httpRequest({
      resource: '/chat/api/rooms/create',
      method: 'POST',
      body: JSON.stringify({'chatter': chatter}),
      successCallback: response => {
        if (Object.keys(response.data).length === 0)
          return showMessage("Can't create/retrieve room for this user", "danger")

        const startUserChat = document.getElementById('startUserChat')
        startUserChat && startUserChat.lastElementChild.lastElementChild.click()
      }
    }).send()
  }

  self.getRoom = (roomId) => {
    return new httpRequest({
      resource: `/chat/api/room/${roomId}/get`,
      method: 'GET',
      successCallback: response => response['data']['room']
    }).send()
  }

  self.startChatting = (room) => {
    room = JSON.parse(decodeURIComponent(room))
    const user = room.user
    const roomId = room.id
    const blocked = room.blocked
    const participant = room.participants[0]

    self.resetSideBarNotifications()

    self.configureMessageCard(roomId)

    self.configureChatHeader(roomId, participant, blocked, user)

    self.configureChatBody(roomId, participant, blocked, user)

    self.configureChatInput()

    self.initWebSocketConnection(roomId)
  }

  self.resetSideBarNotifications = () => {
    Array.from(document.querySelectorAll('#side-message-cards .active')).forEach(el => el.classList.remove('active'))
  }

  self.configureMessageCard = (roomId) => {
    const messageCard = document.getElementById(roomId)
    messageCard && messageCard.classList.add('active')
  }

  self.configureChatHeader = (roomId, participant, blocked, user) => {
    const chatHeader = document.getElementById('chatHeader')
    if (chatHeader) {
      chatHeader.classList.remove('invisible')
      chatHeader.querySelector('p').innerText = participant
      chatHeader.setAttribute('href', `/profile/${participant}`)
    }

    const chatUserBlockToggle = document.getElementById('chatUserBlockToggle')
    if (chatUserBlockToggle) {
      chatUserBlockToggle.dataset.roomId = roomId
      chatUserBlockToggle.dataset.participant = participant
      chatUserBlockToggle.classList.remove('invisible')

      if (participant in blocked && blocked[participant] === user) {
        chatUserBlockToggle.querySelector('p').innerText = 'Unblock'
        chatUserBlockToggle.onclick = MessagesController.unBlockUser
      } else {
        chatUserBlockToggle.querySelector('p').innerText = 'Block'
        chatUserBlockToggle.onclick = MessagesController.blockUser
      }
    }
  }

  self.configureChatBody = (roomId, participant, blocked, user) => {
    const messageContainer = document.getElementById('messageContainer')
    messageContainer && (messageContainer.innerHTML = '')

    self.fetchMessages(messageContainer, roomId, participant, blocked, user)
  }

  self.configureChatInput = () => {
    const messageInputArea = document.getElementById('messageInputArea')
    messageInputArea && messageInputArea.classList.remove('d-none')

    const messageInputButton = document.getElementById('messageInputButton')
    messageInputButton && messageInputButton.classList.remove('d-none')
  }

  self.initWebSocketConnection = (roomId) => {
    if (chatWebSocket && chatWebSocket.readyState === WebSocket.OPEN)
      chatWebSocket.close()

    chatWebSocket = new WebSocket(`wss://${location.host}/chat/room/${roomId}`)
    chatWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const messageContainer = document.getElementById('messageContainer')

      switch (data['type']) {
        case 'chat':
          const message = data.message
          const sentDate = data.created_at
          const roomId = data.room_id

          messageContainer && messageContainer.insertAdjacentHTML(
            'beforeend',
            ChatComponents.senderMessage({'messageText': message, 'sentDateTime': sentDate})
          )

          if (message) {
            document.getElementById(`${roomId}_message`).innerHTML = message
            document.getElementById(`${roomId}_sentDate`).innerText = sentDate
          }

          messageContainer.scrollTop = messageContainer.scrollHeight

          break

        case 'block':
        case 'unblock':
          self.toggleBlockedChatView({'blocked_users': Object.values(data['blocked_users'])})
          break
      }
    }
  }

  self.fetchMessages = (messageContainer, roomId, participant, blocked, user) => {
    self.getMessages(roomId).then(messages => {
      if (!messages)
        return

      for (const message of messages) {
        if (participant === message['sender'])
          messageContainer.insertAdjacentHTML(
            'beforeend',
            ChatComponents.senderMessage({'messageText': message['message'], 'sentDateTime': message['created_at']})
          )
        else
          messageContainer.insertAdjacentHTML(
            'beforeend',
            ChatComponents.recieverMessage({'messageText': message['message'], 'sentDateTime': message['created_at']})
          )
      }

      if (Object.keys(blocked).length !== 0)
        self.toggleBlockedChatView({'blocked_users': Object.values(blocked)})

      messageContainer.scrollTop = messageContainer.scrollHeight
    })
  }

  self.getMessages = (roomId) => {
    return new httpRequest({resource: `/chat/api/room/${roomId}/messages`, method: 'GET', successCallback: response => {
      if (response)
        return response['data'] || []
      else
        return []
    }}).send()
  }

  self.sendMessage = (event) => {
    event.preventDefault()
    const messageForm = document.getElementById('messageForm')
    const messageInputArea = document.getElementById('messageInputArea')
    const messageContainer = document.getElementById('messageContainer')
    const blockedChatMessageContainer = document.getElementById('blockedChatMessageContainer')

    if (chatWebSocket && chatWebSocket.readyState === WebSocket.OPEN) {
      const message = messageInputArea.value

      if (!message)
        return

      const sentDate = self.getCurrentDateTime()

      chatWebSocket.send(JSON.stringify({
        'message': message
      }))

      messageContainer.insertAdjacentHTML(
        'beforeend',
        ChatComponents.recieverMessage({
          'messageText': escapeHtml(message),
          'sentDateTime': blockedChatMessageContainer ? 'Not delivered' : sentDate,
          'failed': Boolean(blockedChatMessageContainer)
        })
      )

      const activeMessageCardId = document.querySelector('#side-message-cards .active').id
      document.getElementById(`${activeMessageCardId}_message`).innerText = message
      document.getElementById(`${activeMessageCardId}_sentDate`).innerText = sentDate

      messageContainer.scrollTop = messageContainer.scrollHeight
    }

    messageForm.reset()
  }

  self.getCurrentDateTime = () => {
    const today = new Date()
    const year = today.getFullYear()
    let month = today.getMonth() + 1
    let day = today.getDate()

    if (day < 10)
      day = '0' + day

    if (month < 10)
      month = '0' + month

    return day + '-' + month + '-' + year + ' ' + today.getHours() + ':' + today.getMinutes()
  }

  self.toggleBlockedChatView = (data) => {
    const blockedUsers = data['blocked_users']
    const blockedChatMessageContainer = document.getElementById('blockedChatMessageContainer')
    blockedChatMessageContainer && blockedChatMessageContainer.remove()

    if (blockedUsers.length === 0) {
      const messageInputArea = document.getElementById('messageInputArea')
      messageInputArea && messageInputArea.removeAttribute('disabled')

      const messageInputButton = document.getElementById('messageInputButton')
      messageInputButton && messageInputButton.removeAttribute('disabled')

      return
    }

    const messageContainer = document.getElementById('messageContainer')
    messageContainer && messageContainer.insertAdjacentHTML(
      'beforeend',
      `
      <div id="blockedChatMessageContainer" class="d-flex justify-content-center mb-2">
        <span class="badge border border-danger rounded-pill text-danger">
            This chat was blocked by <span> ${blockedUsers.join(', ')} <span>
        </span>
      </div>
      `
    )

    const messageInputArea = document.getElementById('messageInputArea')
    messageInputArea && messageInputArea.setAttribute('disabled', true)

    const messageInputButton = document.getElementById('messageInputButton')
    messageInputButton && messageInputButton.setAttribute('disabled', true)

    messageContainer.scrollTop = messageContainer.scrollHeight
  }

  self.blockUser = (e) => {
    const data = e.target.dataset
    const roomId = data['roomId']
    const participant = data['participant']

    new httpRequest({resource: `/chat/api/room/${roomId}/participants/${participant}/block`, method: 'GET', successCallback: response => {
      if (!('data' in response) || !('blocked' in response['data']))
        return showMessage('User blocking failed', 'danger')

      showMessage('User blocked successfully')

      chatWebSocket.send(JSON.stringify({
        'type': 'block',
        'room_id': roomId,
        'username': participant
      }))

      const chatUserBlockToggle = document.getElementById('chatUserBlockToggle')
      if (chatUserBlockToggle) {
        chatUserBlockToggle.querySelector('p').innerText = 'Unblock'
        chatUserBlockToggle.onclick = MessagesController.unBlockUser
      }

    }}).send()
  }

  self.unBlockUser = (e) => {
    const data = e.target.dataset
    const roomId = data['roomId']
    const participant = data['participant']

    new httpRequest({resource: `/chat/api/room/${roomId}/participants/${participant}/unblock`, method: 'GET', successCallback: response => {
      if (!('data' in response) || !('blocked' in response['data']))
        return showMessage('User unblocking failed', 'danger')

      showMessage('User unblocked successfully')

      chatWebSocket.send(JSON.stringify({
        'type': 'unblock',
        'room_id': roomId,
        'username': participant
      }))

      const chatUserBlockToggle = document.getElementById('chatUserBlockToggle')
      if (chatUserBlockToggle) {
        chatUserBlockToggle.querySelector('p').innerText = 'Block'
        chatUserBlockToggle.onclick = MessagesController.blockUser
      }

    }}).send()
  }

  return self
  })()
