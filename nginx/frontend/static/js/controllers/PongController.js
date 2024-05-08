var PongController = (() => {
  var gameWebSocket
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.initPong = async (match) => {
    if (typeof match !== 'object' || Object.keys(match).length === 0)
      return

    self.gameInstance = new PongGame({
      containerID: 'pongCont',
      multiplayer: true,
      leftSideName: match.players[0],
      rightSideName: match.players[1],
    })

    self.initGameWebSocketConnection(match, self.gameInstance)

    self.gameInstance.gameWebSocket = gameWebSocket
  }

  self.initGameWebSocketConnection = (match, gameInstance) => {
    if (!gameWebSocket || [WebSocket.CLOSING, WebSocket.CLOSED].includes(gameWebSocket.readyState))
      gameWebSocket = new WebSocket(`wss://${location.host}/game/pong/room/${match.id}`)
    else
      gameWebSocket.send(JSON.stringify({'type': 'pong_reconnect'}))

    gameWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)

      switch (data['type']) {
        case 'pong_start':
        case 'pong_reconnect':
          const pongCont = document.getElementById('pongCont')
          const pongWaintingCont = document.getElementById('pongWaintingCont')

          pongCont && pongCont.classList.remove('d-none')
          pongWaintingCont && pongWaintingCont.classList.add('d-none')
          gameInstance.init(data)

        break
        case 'pong_packet':
          gameInstance.refresh(data.data)
          break
        case 'pong_end':
          if (gameWebSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(gameWebSocket.readyState))
            gameWebSocket.close()

          break
      }
    }

    return gameWebSocket
  }

  self.createSinglePong = () => {
    // self.initPong()
  }

  self.getMatch = async (matchId) => {
    return new httpRequest({
      resource: `/game/api/match/${matchId}/get`,
      method: 'GET',
      successCallback: response => response['data']['match']
    }).send()
  }

  self.notifyPlayer = (match) => {
    match = JSON.parse(decodeURIComponent(match))
    match['type'] = 'notifications'
    match['subtype'] = 'game_invite'

    const notificationWebSocket = NotificationController.getNotificationWebSocketInstance()

    if (notificationWebSocket && notificationWebSocket.readyState === WebSocket.OPEN)
      notificationWebSocket.send(JSON.stringify(match))
  }

  self.notifyDecline = (opponent, matchId, toastId) => {
    ToastComponents.hide(toastId)

    const notificationWebSocket = NotificationController.getNotificationWebSocketInstance()

    if (notificationWebSocket && notificationWebSocket.readyState === WebSocket.OPEN)
      notificationWebSocket.send(JSON.stringify({
        'type': 'notifications',
        'subtype': 'game_decline',
        'opponent': opponent,
        'match_id': matchId
      }))
  }

  self.notifyAccept = (opponent, matchId, toastId) => {
    ToastComponents.hide(toastId)

    const notificationWebSocket = NotificationController.getNotificationWebSocketInstance()

    if (notificationWebSocket && notificationWebSocket.readyState === WebSocket.OPEN) {
      notificationWebSocket.send(JSON.stringify({
        'type': 'notifications',
        'subtype': 'game_accept',
        'opponent': opponent,
        'match_id': matchId
      }))

      const hiddenGameAccept = document.getElementById('hiddenGameAccept')
      hiddenGameAccept && hiddenGameAccept.click()
    }
  }

  return self
})()
