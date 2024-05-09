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
      const pongCont = document.getElementById('pongCont')

      switch (data['type']) {
        case 'pong_start':
        case 'pong_reconnect':
          const pongNotifyOpponent = document.getElementById('pongNotifyOpponent')
          pongNotifyOpponent && pongNotifyOpponent.remove()

          const pongWaintingCont = document.getElementById('pongWaintingCont')
          pongWaintingCont && pongWaintingCont.classList.add('d-none')

          pongCont && pongCont.classList.remove('d-none')

          gameInstance.init(data)

          break
        case 'pong_packet':
          gameInstance.refresh(data.data)
          break
        case 'pong_end':
          if (gameWebSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(gameWebSocket.readyState))
            gameWebSocket.close()

          delete self['gameInstance']
          if (pongCont) {
            pongCont.innerHTML = ''
            pongCont.classList.add('d-none')
          }

          const pongResultCont = document.getElementById('pongResultCont')
          pongResultCont && pongResultCont.classList.remove('d-none')

          const pongResultScore = document.getElementById('pongResultScore')
          if (pongResultScore) {
            const score = data.score
            const players = data.players
            const leftPlayer = players.at(0)
            const rightPlayer = players.at(-1)
            pongResultScore.innerText = `(${leftPlayer}) ${score[leftPlayer]} : ${score[rightPlayer]} (${rightPlayer})`
          }

          const pongResultMessage = document.getElementById('pongResultMessage')
          if (pongResultMessage) {
            const winMessages = [
              "Well done! You're the Pong ace!", "Congratulations! You've conquered the Pong battlefield!","Victory is yours! You're the undisputed Pong champ!",
              "Congratulations! You've mastered the art of Pong!", "Bravo! You're the Pong virtuoso!", "Victory dance time! You're the Pong superstar!"
            ]
            const loseMessages = [
              "Hard luck! Keep honing those skills!", "Tough one! Practice makes perfect!", "Close match! Keep practicing and you'll dominate!",
              "Unlucky! Keep your paddle up and try again!", "Tough break! The next game's yours!", "Close call! You're getting closer with each game!"
            ]

            if (data.winner === window.user.login)
              pongResultMessage.innerText = winMessages[Math.floor(Math.random() * winMessages.length)]
            else
              pongResultMessage.innerText = loseMessages[Math.floor(Math.random() * loseMessages.length)]
          }

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
