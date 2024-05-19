var PongController = (() => {
  var gameWebSocket
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.initPong = async (match) => {
    if (typeof match !== 'object' || Object.keys(match).length === 0)
      return

    let leftSideName = ''
    let rightSideName = ''
    const match_players = match.players

    if (match_players.length > 1) {
      leftSideName = match_players[0]
      rightSideName = match_players[1]
    } else {
      leftSideName = 'left'
      rightSideName = 'right'
    }

    self.gameInstance = new PongGame({
      containerID: 'pongCont',
      multiplayer: match_players.length > 1,
      leftSideName: leftSideName,
      rightSideName: rightSideName,
    })

    self.initGameWebSocketConnection(match, self.gameInstance)

    self.gameInstance.gameWebSocket = gameWebSocket

    document.addEventListener("visibilitychange", (event) => {
      if (document.visibilityState == "visible") {
        // send pong pause
        console.log("tab is active")
      } else {
        console.log("tab is inactive")
      }
    })

    window.navigation.addEventListener("navigate", (event) => {
      const currentLocation = window.location.href.replace(window.location.origin, '')
      const nextLocation = event.destination.url.replace(window.location.origin, '')

      if (currentLocation.startsWith('/pong') && nextLocation !== currentLocation) {
        console.log('game is switched')
      }
    })
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
          const score = data.score
          const players = data.players
          const leftPlayer = players.at(0)
          const rightPlayer = players.at(-1)

          const pongResultCont = document.getElementById('pongResultCont')
          pongResultCont && pongResultCont.classList.remove('d-none')

          const pongResultScore = document.getElementById('pongResultScore')
          if (pongResultScore) {
            if (leftPlayer === rightPlayer)
              pongResultScore.innerText = `(left) ${score[`${leftPlayer}Left`] || '0'} : ${score[`${rightPlayer}Right`] || '0'} (right)`
            else
              pongResultScore.innerText = `(${leftPlayer}) ${score[leftPlayer] || '0'} : ${score[rightPlayer] || '0'} (${rightPlayer})`
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
            const drawMessages = [
              "Fantastic game! Both of you were amazing!", "Great effort from both sides! Well played!", "What a match! You both rocked it!",
              "Superb playing! That was intense!", "Awesome game! Both players were on fire!", "Incredible match! You both showed great skill!"
            ]

            if (leftPlayer === rightPlayer) {
              pongResultMessage.innerText = drawMessages[Math.floor(Math.random() * drawMessages.length)]
            } else {
              if (data.winner === window.user.login)
                pongResultMessage.innerText = winMessages[Math.floor(Math.random() * winMessages.length)]
              else
                pongResultMessage.innerText = loseMessages[Math.floor(Math.random() * loseMessages.length)]
            }
          }

          break
      }
    }

    return gameWebSocket
  }

  self.createPongGame = async (e) => {
    const dataset = e.dataset
    const participant = dataset.participant
    const matchId = await self.createMatch(participant)

    if (!matchId)
      return

    // This is a shame, I hope no one sees
    e.href = `/pong/${matchId}`
    e.dataset.link = ''
    e.onclick = ''
    e.click()
    showMessage('The match was successfully created', 'success')
  }

  self.getMatch = async (matchId) => {
    return new httpRequest({
      resource: `/game/api/match/${matchId}`,
      method: 'GET',
      successCallback: response => response['data']['match']
    }).send()
  }

  self.createMatch = async (participant) => {
    return new httpRequest({
      resource: `/game/api/match/create`,
      method: 'POST',
      body: JSON.stringify({'game': 'pong', 'username': participant}),
      successCallback: response => response['data']['match_id']
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

  self.getProfileStatsView = async (userInformation) => {
    const stats = await new httpRequest({
      resource: `/game/api/match/stats/${userInformation.login}`,
      method: 'GET',
      successCallback: response => response['data']
    }).send()

    return `
    <div class="position-relative p-5 text-start bg-body border rounded-4 mb-3">
      <h3 class="border-bottom pb-2">Stats</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container text-center">
          <div class="row">

            <div class="col-4 col-sm-4 d-flex justify-content-center">
              <div class="px-2">
                <i class="bi bi-controller h1"></i>
                <p class="text-center text-wrap">Played: ${stats?.played || '0'}</p>
              </div>
            </div>

            <div class="col-4 col-sm-4 d-flex justify-content-center">
              <div class="px-2">
                <i class="bi bi-emoji-laughing h1"></i>
                <p class="text-center text-wrap">Won: ${stats?.won || '0'}</p>
              </div>
            </div>

            <div class="col-4 col-sm-4 d-flex justify-content-center">
              <div class="px-2">
                <i class="bi bi-emoji-frown h1"></i>
                <p class="text-center text-wrap">Lost: ${stats?.lost || '0'}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    `
  }

  self.getProfileMatchHistoryView = async (userInformation) => {
    const matchHistoryData = await new httpRequest({
      resource: `/game/api/match/history/${userInformation.login}`,
      method: 'GET',
      successCallback: response => response['data']
    }).send()

    if (!matchHistoryData)
      return ''

    return `
    <div class="position-relative p-5 text-start bg-body border rounded-4 mb-3">
      <h3 class="border-bottom pb-2">Match history</h3>
      ${TableComponent.init({'headers': matchHistoryData['headers'], 'data': matchHistoryData['match_history']})}
    </div>
    `
  }

  return self
})()
