var TournamentsController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.create = () => {
    const tournamentForm = document.getElementById('tournamentForm')
    const name = tournamentForm.querySelector('#name')
    const game = tournamentForm.querySelector('#game')
    const size = tournamentForm.querySelector('#size')
    const nameValue = name.value
    const gameValue = game.value
    const sizeValue = Number(size.value)

    if (!nameValue) {
      tournamentForm.querySelector('#name_invalid_feedback').innerText = "Tournament name can't be empty"
      name.classList.add('is-invalid')
      return
    } else if (!gameValue || !['pong'].includes(gameValue)) {
      tournamentForm.querySelector('#game_invalid_feedback').innerText = "Tournament game is not correct"
      game.classList.add('is-invalid')
      return
    } else if (!sizeValue || ![4, 8, 16, 32, 64].includes(sizeValue)) {
      tournamentForm.querySelector('#size_invalid_feedback').innerText = "Tournament size is not correct"
      size.classList.add('is-invalid')
      return
    }

    const body = {'name': nameValue, 'game': gameValue, 'size': sizeValue}

    new httpRequest({
      resource: `/game/api/tournament/create`,
      method: 'POST',
      body: JSON.stringify(body),
      successCallback: response => {
        if (!('message' in response))
          return

        if ('errors' in response) {
          for (const [key, value] of Object.entries(response['errors'])) {
            if (value.constructor === Array && value.length > 0)
              document.getElementById(`${key}_invalid_feedback`).innerText = value[0]

            document.getElementById(key).classList.add('is-invalid')
          }

          showMessage(response['message'], 'danger')
        }
        else {
          for (const field in body) {
            const element = document.getElementById(field)

            if (element.classList.contains('is-invalid'))
              element.classList.remove('is-invalid')

            element.classList.add('is-valid')
            if (element.tagName === 'SELECT')
              element.selectedIndex = 0
            else
              element.value = ''
          }

          showMessage(response['message'], 'success')

          self.reloadListing()
        }
      }
    }).send()
  }

  self.list = async () => {
    const tournamentData = await new httpRequest({
      resource: `/game/api/tournament/list`,
      method: 'GET',
      successCallback: response => {
        return response && response.data
      }
    }).send()

    const headers = tournamentData['headers']
    const tournaments = tournamentData['tournaments']

    if (!tournamentData || !tournaments || !headers)
      return `
      <div class="vh-70">
        <div class="d-flex justify-content-center align-items-center h-100">
          <span class="badge border border-secondary rounded-pill text-secondary">
            Could not find any tournaments
          </span>
        </div>
      </div>
      `

    for (const tournament of tournaments) {
      let buttonStyle = ''
      let buttonEvent = ''
      const tournamentId = tournament['id']
      const tournamentDraw = tournament['draw']
      const tournamentParticipants = tournament['participants']
      const activity = tournament['activity']
      const activityTitle =activity['title']

      switch (activityTitle) {
        case 'register':
          buttonStyle = 'outline-success'
          buttonEvent = `TournamentsController.setAlias("${tournamentId}")`
          break
        case 'unregister':
          buttonStyle = 'outline-danger'
          buttonEvent = `TournamentsController.unRegister("${tournamentId}")`
          break
        case 'watch':
          buttonStyle = 'outline-info'
          buttonEvent = `TournamentsController.watch("${encodeURIComponent(JSON.stringify({'draw': tournamentDraw, 'participants': tournamentParticipants}))}")`
          break
        case 'results':
          buttonStyle = 'outline-secondary'
          buttonEvent = `TournamentsController.watch("${encodeURIComponent(JSON.stringify({'draw': tournamentDraw, 'participants': tournamentParticipants}))}")`
          break
      }

      tournament['activity'] = Components.button({
        'buttonId': tournamentId,
        'buttonClass': buttonStyle,
        'buttonLabel': activityTitle,
        'js': {
          'onclick': buttonEvent
        }
      })
    }
    const upcomingGamesCont = document.getElementById('upcomingGamesCont')
    upcomingGamesCont && (upcomingGamesCont.innerHTML = await self.initUpcomingGames())

    return TableComponent.init({'headers': headers, 'data': tournaments})
  }

  self.setAlias = (tournamentId) => {
    document.getElementsByClassName('modals')[0].innerHTML = Components.modal({
      'size': 'default',
      'modalId': 'nameAliasModalId',
      'modalTitle': 'Provide an alias name for your username',
      'modalBody': Components.input({'id': 'newAliasName', 'label': 'You will participate in matches under this new name', 'maxlength': 16}),
      'approveButtonId': 'registerModalId',
      'approveButtonTitle': 'Register',
      'approveButtonClass': 'btn btn-primary',
      'cancelButtonTitle': 'Cancel',
      'cancelButtonClass': 'btn btn-secondary',
    })
    const nameAliasModalCont = document.getElementById("nameAliasModalId")

    new bootstrap.Modal(nameAliasModalCont, {}).show()

    nameAliasModalCont.addEventListener('shown.bs.modal', () => {
      document.getElementById('newAliasName').focus()
      document.getElementById('registerModalId').onclick = () => {TournamentsController.register(tournamentId)}
    })
  }

  self.register = (tournamentId) => {
    const newAliasCont = document.getElementById('newAliasName')
    const newAliasContFeedback = document.getElementById('newAliasName_invalid_feedback')
    const newAliasName = newAliasCont.value

    if (!tournamentId)
      return

    if (newAliasName.length > 16) {
      newAliasCont.classList.add('is-invalid')
      newAliasContFeedback.innerText = "The length of an alias name cannot be greater than 16"
    }

    newAliasCont.classList.remove('is-invalid')
    newAliasContFeedback.innerText = ""

    new httpRequest({
      resource: `/game/api/tournament/register`,
      method: 'POST',
      body: JSON.stringify({'tournament_id': tournamentId, 'alias': newAliasName}),
      successCallback: response => {
        if ('message' in response && response['message'])
          showMessage(response['message'], 'success')

        const nameAliasModal = bootstrap.Modal.getInstance(document.getElementById("nameAliasModalId"))
        nameAliasModal && nameAliasModal.hide()

        self.reloadListing()
      }
    }).send()
  }

  self.unRegister = (tournamentId) => {
    new httpRequest({
      resource: `/game/api/tournament/unregister`,
      method: 'POST',
      body: JSON.stringify({'tournament_id': tournamentId}),
      successCallback: response => {
        if ('message' in response && response['message'])
          showMessage(response['message'], 'success')

        self.reloadListing()
      }
    }).send()
  }

  self.watch = (data) => {
    data = JSON.parse(decodeURIComponent(data))
    document.getElementsByClassName('modals')[0].innerHTML = Components.modal({
      'size': 'extraLarge',
      'centered': true,
      'modalId': 'watchTournamentModalId',
      'modalTitle': 'Current matches of the tournament',
      'modalBody': TournamentBracketComponent.init({'draw': data.draw, 'participants': data.participants}),
      'cancelButtonTitle': 'Close',
      'cancelButtonClass': 'btn btn-secondary',
    })
    new bootstrap.Modal(document.getElementById("watchTournamentModalId"), {}).show()
  }

  self.initUpcomingGames = async () => {
    return await new httpRequest({
      resource: `/game/api/tournament/games/upcoming`,
      method: 'GET',
      successCallback: response => {
        if ((!response) || !('data' in response) || !('matches' in response['data']) || !('tournaments' in response['data']))
          return ''

        let upcomingGames = ''
        const data = response['data']
        const matches = data['matches']
        const tournaments = data['tournaments']

        for (const match of matches) {
          let playerNames = []
          let playerImages = []
          const game = match['game']
          const score = match['score']
          const status = match['status']
          const players = match['players']
          const tournament = tournaments[(match['tournament'] || {})['id']]
          const tournamentName = tournament['name']
          const tournamentParticipants = tournament['participants']

          for (const player of players) {
            playerNames.push(`<u>${tournamentParticipants[player]['alias']} (${player})</u>`)
            playerImages.push(`<img src="/auth/api/avatar/${player}" width="32" height="32" class="rounded-circle border object-fit-cover">`)
          }

          playerNames = playerNames.join(', ')

          let button = ''

          if (status === 'created') {
            if (players.includes(window.user.login))
              button = `<a href="/${game}/${match['id']}" type="button" class="btn btn-success" data-link>Play now</a>`
            else
              button = `<a type="button" class="btn btn-outline-secondary pe-none">Not started</a>`
          } else if (status === 'playing') {
            if (players.includes(window.user.login))
              button = `<a href="/${game}/${match['id']}" type="button" class="btn btn-primary" data-link>Continue</a>`
            else
              button = `<a type="button" class="btn btn-outline-info pe-none">${score[players.at(0)] || '0'} : ${score[players.at(-1)] || '0'}</a>`
          }

          upcomingGames += `
          <div class="list-group-item list-group-item-action">
            <div class="card card-cover h-100 overflow-hidden bg-body-tertiary rounded-4">
              <div class="d-flex flex-column px-4 text-shadow-1">
                <h3 class="pt-5 mb-4 display-7 lh-1 fw-bold">
                  ${game && `Game: <u>${game}</u>`}
                  ${tournamentName && `Tournament: <u>${tournamentName}</u>`}
                  ${playerNames && `Players: ${playerNames}`}
                </h3>
                <ul class="d-flex list-unstyled mt-auto">
                  <li class="me-auto">
                    ${playerImages.join(`<span class="px-1 fw-bold"> VS </span>`)}
                  </li>
                  <li class="d-flex align-items-center">
                    ${button}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          `
        }

        return `
        <div class="row g-3">
          ${upcomingGames}
        </div>
        `
      }
    }).send()
  }

  self.reloadListing = async () => {
    document.getElementById('tournamentListing').innerHTML = await self.list()
  }

  self.getProfileTournamnetsView = async (userInformation) => {
    return `
    <div class="position-relative p-5 text-start bg-body border rounded-4 mb-3">
      <h3 class="border-bottom pb-2">Tournaments</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container text-center">
          <div class="row">

            <div class="col-3 col-sm-3 d-flex justify-content-center">
              <div class="px-2">
                <i class="bi bi-trophy h1"></i>
                <p class="text-center text-wrap">No tournaments found</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    `
  }

  return self
})()
