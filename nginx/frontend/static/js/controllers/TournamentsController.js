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

    new httpRequest({
      resource: `/game/api/tournament/create`,
      method: 'POST',
      body: JSON.stringify({'name': nameValue, 'game': gameValue, 'size': sizeValue}),
      successCallback: response => {
        console.log('/game/api/tournament/create:', response)
      }
    }).send()
  }

  return self
})()
