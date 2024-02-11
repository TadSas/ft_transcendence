var NotificationController = (() => {
  var notificationWebSocket
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.initChat = () => {
    notificationWebSocket = new WebSocket(`wss://${location.host}/chat/room/notifications`)
    notificationWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data['type'] === 'notifications' && data['subtype'] === 'chat' && location.pathname !== '/messages') {
        const sender = data['sender']

        ToastComponents.createToast({
          id: data['id'],
          icon: 'chat-text-fill',
          title: `${sender['login']} (${sender['first_name']} ${sender['last_name']})`,
          dateTime: data['created_at'].split(' ').at(-1),
          body: data['message']
        })
        bootstrap.Toast.getOrCreateInstance(document.getElementById(data['id'])).show()
        document.getElementById('nav-messages').querySelector('.sidebar-icon-notification').classList.remove('d-none')
      }
    }
  }

  return self
})()
