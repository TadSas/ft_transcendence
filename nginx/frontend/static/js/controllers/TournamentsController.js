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
      resource: `/game/api/tournaments/get`,
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

    return TableComponent.init({'headers': headers, 'data': tournaments})
  }

  self.reloadListing = async () => {
    document.getElementById('tournamentListing').innerHTML = await self.list()
  }

  return self
})()
