var PongController = (() => {
  var gameWebSocket
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.initPong = async (matchId) => {
    if (matchId) {
      const match = await self.getMatch(matchId)
      const matchPlayers = match.players
      const homePlayer = matchPlayers[0]
      const awayPlayer = matchPlayers[1]

      const gameInstance = new PongGame({
        containerID: 'pongCont',
        multiplayer: true,
        leftUsername: homePlayer,
        rightUsername: awayPlayer,
        controlSide: homePlayer == window.user.login ? 'left' : 'right'
      })

      self.initGameWebSocketConnection(match, gameInstance)

      gameInstance.setGameWebSocket(gameWebSocket)
      gameInstance.start()

      return
    }

    new PongGame({containerID: 'pongCont'}).start()
  }

  self.initGameWebSocketConnection = (match, gameInstance) => {
    if (gameWebSocket && gameWebSocket.readyState === WebSocket.OPEN)
      gameWebSocket.close()

    gameWebSocket = new WebSocket(`wss://${location.host}/game/pong/room/${match.id}`)
    gameWebSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      gameInstance.setPaddleMovingDirection(data['paddle_type'], data['paddle_moving_direction'])
      gameInstance.smoothMovePaddleYPosition(data['paddle_type'], data['padle_y_position'])
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
