import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Tournaments")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)
    this.viewEventStore.push({
      'click': {
        'document.getElementById("reloadListing")': e => {
          TournamentsController.reloadListing()
        }
      }
    })

    return `
    <div class="row overflow-hidden mx-0">
      <div class="col-2 px-0">
        <div class="px-3 py-2 bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded me-1">
          <p class="h5 mb-0 py-1 short-text">Create a tournament</p>
        </div>
        <div class="p-3 vh-80 overflow-x-scroll bg-opacity-50 border rounded me-1">
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

      <div class="col-8 px-0">
        <div class="px-4 py-2 d-flex align-items-center bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded me-1">
          <p class="h5 mb-0 py-1 me-2 pe-none">Tournaments</p>
          <div id="reloadListing" role="button" class="d-flex align-items-center link-body-emphasis text-decoration-none">
            <i class="bi bi-arrow-clockwise pe-none me-2 mb-0 mt-1 h5"></i>
          </div>
        </div>
        <div class="p-3 vh-80 overflow-x-scroll bg-opacity-50 border rounded me-1">
          <div id="tournamentListing">
            ${await TournamentsController.list()}
          </div>
        </div>
      </div>


      <div class="col-2 px-0">
        <div class="px-3 py-2 bg-body-tertiary bg-opacity-50 border border-bottom-0 rounded me-1">
          <p class="h5 mb-0 py-1 short-text">Upcoming games</p>
        </div>
        <div class="p-3 vh-80 overflow-x-scroll bg-opacity-50 border rounded me-1">
          <div id="upcomingGamesCont">
            ${await TournamentsController.initUpcomingGames()}
          </div>
        </div>
      </div>
    </div>
    `
  }
}