var MessagesController = (() => {
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
        let responseData = response.data

        if (Object.keys(responseData).length === 0) {
          showMessage("Can't create/retrieve room for this user", "danger")
          return
        } else {
          const startUserChat = document.getElementById('startUserChat')
          startUserChat && (startUserChat.href = "/messages")
          startUserChat && startUserChat.click()
        }
      }
    }).send()
  }

  self.startChatting = (roomId) => {
    // const ws = new WebSocket(`wss://${location.host}/chat/room`)
    // ws.onmessage = event => console.log(event.data)
    // ws.send("ping")
  }

  self.getRooms = () => {
  }

  return self
  })()
