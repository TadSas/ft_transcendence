var PongController = (() => {
  var gameWebSocket
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.initPong = async (match) => {
    if (typeof match === 'object' && Object.keys(match).length > 0) {
      const matchPlayers = match.players
      const homePlayer = matchPlayers[0]
      const awayPlayer = matchPlayers[1]

      self.gameInstance = new PongGame({
        containerID: 'pongCont',
        multiplayer: true,
        leftUsername: homePlayer,
        rightUsername: awayPlayer,
        controlSide: homePlayer == window.user.login ? 'left' : 'right'
      })

      self.initGameWebSocketConnection(match, self.gameInstance)

      // self.gameInstance.setGameWebSocket(gameWebSocket)
      // self.gameInstance.start()

      return
    }

    self.gameInstance = new PongGame({containerID: 'pongCont'})
    self.gameInstance.start()
    self.gameInstance.insertGamecanvas()
  }

  self.initGameWebSocketConnection = (match, gameInstance) => {
    const matchPlayers = match.players

    if (gameWebSocket && gameWebSocket.readyState === WebSocket.OPEN)
      gameWebSocket.close()

    gameWebSocket = new WebSocket(`wss://${location.host}/game/pong/room/${match.id}`)

    gameWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)

      switch (data['type']) {
        case 'pong_start':
          const pongCont = document.getElementById('pongCont')
          const pongWaintingCont = document.getElementById('pongWaintingCont')

          // gameInstance.insertGamecanvas()
          pongCont && pongCont.classList.remove('d-none')
          pongWaintingCont && pongWaintingCont.classList.add('d-none')
          gameInstance.drawGame(data)
          // gameInstance.setBallDirection()

        break
        case 'pong_packet':
          gameInstance.setPaddleMovingDirection(data['paddle_type'], data['paddle_moving_direction'])
          gameInstance.smoothMovePaddleYPosition(data['paddle_type'], data['padle_y_position'])

          break
      }
    }

    return gameWebSocket
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
