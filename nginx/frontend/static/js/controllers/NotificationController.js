var NotificationController = (() => {
  var notificationWebSocket
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.getNotificationWebSocketInstance = () => notificationWebSocket

  self.init = () => {
    notificationWebSocket = new WebSocket(`wss://${location.host}/chat/room/notifications`)
    notificationWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data['type'] !== 'notifications')
        return

      const subtype = data['subtype']

      switch (subtype) {
        case 'chat': {
          if (location.pathname === '/messages')
            break

          const sender = data['sender']
          const toastId = `${data['id']}Toast`

          ToastComponents.createToast({
            id: toastId,
            icon: 'chat-text-fill',
            title: `${sender['login'] || ''} (${sender['first_name'] || ''} ${sender['last_name'] || ''})`,
            dateTime: data['created_at'].split(' ').at(-1),
            body: data['message']
          })
          ToastComponents.show(toastId)
          document.getElementById('nav-messages').querySelector('.sidebar-icon-notification').classList.remove('d-none')

          break
        }
        case 'game_invite': {
          const game = data['game']
          const matchId = data['id']
          const toastId = `${subtype}${matchId}Toast`
          const opponent = data['opponent']
          const tournament = data['tournament'] || {}
          const acceptEvent = `PongController.notifyAccept('${opponent}','${matchId}','${toastId}')`
          const declineEvent = `PongController.notifyDecline('${opponent}','${matchId}','${toastId}')`
          const body = `
          <h3 class="fs-6 lh-1 fw-bold">
            Opponent: <u>${opponent || ''}</u>
          </h3>
          <h3 class="fs-6 lh-1 fw-bold">
            Tournament: <u>${tournament['name'] || ''}</u>
          </h3>
          <hr>
          ${Components.button({'buttonLabel': 'Decline', 'buttonClass': 'secondary me-4', 'js': {'onclick': declineEvent}})}
          ${Components.button({'buttonLabel': 'Accept', 'buttonClass': 'primary', 'js': {'onclick': acceptEvent}})}
          <a id="hiddenGameAccept" href="/${game}/${matchId}" type="button" class="pe-none d-none" data-link></a>
          `

          ToastComponents.createToast({
            id: toastId,
            icon: 'trophy',
            title: `You have a request for a game of ${game}.`,
            body: body,
            autohide: false
          })
          ToastComponents.show(toastId)

          break
        }
        case 'game_accept': {
          const matchId = data['id']
          const opponent = data['opponent']
          const toastId = `${subtype}${matchId}Toast`
          let dataLink = 'data-link'
          let href = `href="/pong/${matchId}"`

          if (location.pathname.startsWith('/pong/')) {
            href = ''
            dataLink = ``
          }

          ToastComponents.createToast({
            id: toastId,
            icon: 'check-circle',
            title: `${opponent} has accepted your request.`,
            body: `<a ${href} type="button" class="btn btn-primary" ${dataLink} onclick="ToastComponents.hide('${toastId}')">Starting to play now.</a>`,
            autohide: false
          })
          ToastComponents.show(toastId)

          break
        }
        case 'game_decline': {
          const matchId = data['id']
          const opponent = data['opponent']
          const toastId = `${subtype}${matchId}Toast`

          ToastComponents.createToast({
            id: toastId,
            icon: 'x-circle',
            title: `${opponent} has declined your request.`,
            body: "<u>Don't worry, maybe next time.</u>"
          })
          ToastComponents.show(toastId)

          break
        }
        case 'tournament': {
          ToastComponents.createToast({
            id: 'tournament_notification',
            icon: 'trophy',
            title: 'Tournament notification',
            body: data['message'],
            autohide: false
          })
          ToastComponents.show('tournament_notification')

          break
        }
        case 'user_activity': {
          window.userActivity = data['user_activity']
          DashboardController.initPlatformUsers(data['user_activity'])
        }
      }
    }
  }

  return self
})()
