import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Tournaments")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    const tournaments = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Game</th>
          <th scope="col">Size</th>
          <th scope="col">Participants</th>
          <th scope="col">Host</th>
          <th scope="col">Created</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Fujini</td>
          <td>pong</td>
          <td>4x</td>
          <td>0/4</td>
          <td>@stadevos</td>
          <td>18.02.2024</td>
          <td>registration</td>
        </tr>
      </tbody>
    </table>
    `

    return `
    <div class="row overflow-hidden mx-0">
      <div class="col-2 px-0">
        <div class="px-3 py-2 bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded me-1">
          <p class="h5 mb-0 py-1 short-text">Create a tournament</p>
        </div>
        <div class="p-3 chat-box bg-opacity-50 border rounded me-1">
          <div id="tournamentForm">
            <div class="mb-4">
              ${Components.input({'id': 'name', 'label': 'Name of the tournament'})}
            </div>
            <div class="mb-4">
              ${Components.selector({
                'id': 'game',
                'label': 'Game of the tournament',
                'options': [{'value': 'pong', 'title': 'pong'}]
              })}
            </div>
            <div class="mb-4">
              ${Components.selector({
                'id': 'size',
                'label': 'Size of the tournament participants',
                'options': [
                  {'value': '4', 'title': '4x'},
                  {'value': '8', 'title': '8x'},
                  {'value': '16', 'title': '16x'},
                  {'value': '32', 'title': '32x'},
                  {'value': '64', 'title': '64x'},
                ]
              })}
            </div>
            <div class="d-flex align-items-start">
              ${Components.button({'buttonLabel': 'Create', 'js': {'onclick': "TournamentsController.create()"}})}
            </div>
          </div>
        </div>
      </div>
      <div class="col-10 px-0">
        <div class="px-3 py-2 bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded me-1">
          <p class="h5 mb-0 py-1 short-text">Tournaments</p>
        </div>
        <div class="p-3 chat-box bg-opacity-50 border rounded me-1">
          <div>
            ${tournaments}
          </div>
          ${TournamentBracketComponent.init({})}
        </div>
      </div>
    </div>
    `
  }
}