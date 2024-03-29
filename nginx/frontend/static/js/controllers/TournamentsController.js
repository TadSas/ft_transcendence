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
          buttonEvent = ''
          break
        case 'results':
          buttonStyle = 'outline-secondary'
          buttonEvent = ''
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

    return TableComponent.init({'headers': headers, 'data': tournaments})
  }

  self.setAlias = (tournamentId) => {
    document.getElementsByClassName('modals')[0].innerHTML += Components.modal({
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

  self.reloadListing = async () => {
    document.getElementById('tournamentListing').innerHTML = await self.list()
  }

  return self
})()
