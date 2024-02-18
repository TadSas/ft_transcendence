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

    if (!name.value) {
      tournamentForm.querySelector('#name_invalid_feedback').innerText = "Tournament name can't be empty"
      name.classList.add('is-invalid')
      return
    } else if (!game.value || !['pong'].includes(game.value)) {
      tournamentForm.querySelector('#game_invalid_feedback').innerText = "Tournament game is not correct"
      game.classList.add('is-invalid')
      return
    } else if (!size.value || ![4, 8, 16, 32, 64].includes(Number(size.value))) {
      tournamentForm.querySelector('#size_invalid_feedback').innerText = "Tournament size is not correct"
      size.classList.add('is-invalid')
      return
    }
  }

  return self
})()
