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
    const participants = room.participants

    self.resetSideBarNotifications()

    self.configureMessageCard(roomId)

    self.configureChatHeader(roomId, participants, blocked, user)

    self.configureChatBody(roomId, participants)

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

  self.configureChatHeader = (roomId, participants, blocked, user) => {
    const chatHeader = document.getElementById('chatHeader')
    if (chatHeader) {
      chatHeader.classList.remove('invisible')
      chatHeader.querySelector('p').innerText = participants
      chatHeader.setAttribute('href', `/profile/${participants}`)
    }

    const chatUserBlockToggle = document.getElementById('chatUserBlockToggle')
    if (chatUserBlockToggle) {
      chatUserBlockToggle.dataset.roomId = roomId
      chatUserBlockToggle.dataset.participants = participants
      chatUserBlockToggle.classList.remove('invisible')

      if (participants[0] in blocked && blocked[participants[0]]['from'] === user) {
        chatUserBlockToggle.querySelector('p').innerText = 'Unblock'
        chatUserBlockToggle.onclick = MessagesController.unBlockUser
      } else {
        chatUserBlockToggle.querySelector('p').innerText = 'Block'
        chatUserBlockToggle.onclick = MessagesController.blockUser
      }
    }
  }

  self.configureChatBody = (roomId, participants) => {
    const messageContainer = document.getElementById('messageContainer')
    messageContainer && (messageContainer.innerHTML = '')

    self.fetchMessages(messageContainer, roomId, participants)
  }

  self.configureChatInput = () => {
    const messageInputArea = document.getElementById('messageInputArea')
    messageInputArea && messageInputArea.classList.remove('d-none')

    const messageInputButton = document.getElementById('messageInputButton')
    messageInputButton && messageInputButton.classList.remove('d-none')
  }

  self.initWebSocketConnection = (roomId) => {
    if (chatWebSocket && chatWebSocket.readyState !== WebSocket.CLOSED)
      chatWebSocket.close()

    chatWebSocket = new WebSocket(`wss://${location.host}/chat/room/${roomId}`)
    chatWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const message = data.message
      const sentDate = data.created_at

      messageContainer.insertAdjacentHTML(
        'beforeend',
        ChatComponents.senderMessage({'messageText': message, 'sentDateTime': sentDate})
      )

      document.getElementById(`${data['room_id']}_message`).innerHTML = message
      document.getElementById(`${data['room_id']}_sentDate`).innerText = sentDate

      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }

  self.fetchMessages = (messageContainer, roomId, participants) => {
    self.getMessages(roomId).then(messages => {
      if (!messages)
        return

      for (const message of messages) {
        if (participants.includes(message['sender']))
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

    if (chatWebSocket && chatWebSocket.readyState !== WebSocket.CLOSED) {
      const message = messageInputArea.value

      if (!message)
        return

      const sentDate = self.getCurrentDateTime()

      chatWebSocket.send(JSON.stringify({
        'message': message
      }))

      messageContainer.insertAdjacentHTML(
        'beforeend',
        ChatComponents.recieverMessage({'messageText': escapeHtml(message), 'sentDateTime': sentDate})
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

  self.blockUser = (e) => {
    const data = e.target.dataset
    const participants = data['participants']
    const roomId = data['roomId']

    new httpRequest({resource: `/chat/api/room/${roomId}/participants/${participants}/block`, method: 'GET', successCallback: response => {
      if (!('data' in response) || !('blocked' in response['data']))
        return showMessage('User blocking failed', 'danger')

      showMessage('User blocked successfully')

      const chatUserBlockToggle = document.getElementById('chatUserBlockToggle')
      if (chatUserBlockToggle) {
        chatUserBlockToggle.querySelector('p').innerText = 'Unblock'
        chatUserBlockToggle.onclick = MessagesController.unBlockUser
      }

    }}).send()
  }

  self.unBlockUser = (e) => {
    const data = e.target.dataset
    const participants = data['participants']
    const roomId = data['roomId']

    new httpRequest({resource: `/chat/api/room/${roomId}/participants/${participants}/unblock`, method: 'GET', successCallback: response => {
      if (!('data' in response) || !('blocked' in response['data']))
        return showMessage('User unblocking failed', 'danger')

      showMessage('User unblocked successfully')

      const chatUserBlockToggle = document.getElementById('chatUserBlockToggle')
      if (chatUserBlockToggle) {
        chatUserBlockToggle.querySelector('p').innerText = 'Block'
        chatUserBlockToggle.onclick = MessagesController.blockUser
      }

    }}).send()
  }

  return self
  })()
