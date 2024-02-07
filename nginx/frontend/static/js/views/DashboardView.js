import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Dashboard")
  }

  async getUserCards(users) {
    let content = ''

    for (const user of users) {
      const login = user['login'] || ''

      content += `
      <div class="col-1 col-sm-1 d-flex justify-content-center">
        <div class="card-body">
          <div class="px-2 position-relative">
            <img src="/auth/api/avatar/${login}" width="64" height="64" class="rounded-circle border object-fit-cover">
            <p>${login}</p>
            <a href="/profile/${login}" class="stretched-link" data-link></a>
          </div>
        </div>
      </div>
      `
    }

    return content
  }

  async getPlatformUsers() {
    const dashboardUsers = await new httpRequest({resource: '/auth/api/dashboard/users', method: 'GET', successCallback: response => {return response}}).send()
    const users = dashboardUsers['data']
    const onlineUsers = []
    const inGameUsers = []
    const offlineUsers = []

    for (const user of users) {
      switch (user['status']) {
        case 'online':
          onlineUsers.push(user)
          break
        case 'in-game':
          inGameUsers.push(user)
          break
        case 'offline':
          offlineUsers.push(user)
          break
      }
    }

    const onlineUsersTab = `
    <div class="tab-pane fade show active" id="online-tab-pane" role="tabpanel" aria-labelledby="online-tab" tabindex="0">
      <div class="d-flex align-items-end flex-row">
        <div class="container text-center">
          <div class="row">
            ${await this.getUserCards(onlineUsers)}
          </div>
        </div>
      </div>
    </div>
    `

    const inGameUsersTab = `
    <div class="tab-pane fade" id="in-game-tab-pane" role="tabpanel" aria-labelledby="in-game-tab" tabindex="0">
      <div class="d-flex align-items-end flex-row">
        <div class="container text-center">
          <div class="row">
            ${await this.getUserCards(inGameUsers)}
          </div>
        </div>
      </div>
    </div>
    `

    const offlineUsersTab = `
    <div class="tab-pane fade" id="offline-tab-pane" role="tabpanel" aria-labelledby="offline-tab" tabindex="0">
      <div class="d-flex align-items-end flex-row">
        <div class="container text-center">
          <div class="row">
            ${await this.getUserCards(offlineUsers)}
          </div>
        </div>
      </div>
    </div>
    `

    return `
    <div class="container marketing">
      <h1>Platform users</h1>
      <hr class="featurette-divider">
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container text-center"></div>
      </div>
      <div class="card text-center border-0">
        <div class="card-header bg-transparent">
          <ul class="nav nav-tabs card-header-tabs" id="platformUsersTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="online-tab" data-bs-toggle="tab" data-bs-target="#online-tab-pane" type="button" role="tab" aria-controls="online-tab-pane" aria-selected="true">Online</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="in-game-tab" data-bs-toggle="tab" data-bs-target="#in-game-tab-pane" type="button" role="tab" aria-controls="in-game-tab-pane" aria-selected="true">In-game</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="offline-tab" data-bs-toggle="tab" data-bs-target="#offline-tab-pane" type="button" role="tab" aria-controls="offline-tab-pane" aria-selected="true">Offline</button>
            </li>
          </ul>
        </div>

        <div class="tab-content" id="platformUsersTabContent">
          ${onlineUsersTab}
          ${inGameUsersTab}
          ${offlineUsersTab}
        </div>

      </div>
    </div>
    `
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    const carousel = `
    <div id="myCarousel" class="carousel carousel-dark slide mb-6" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="0" class="active" aria-label="Slide 1" aria-current="true"></button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1" aria-label="Slide 2" class=""></button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="2" aria-label="Slide 3" class=""></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active">
          <div class="carousel-page"></div>
          <div class="container">
            <div class="carousel-caption text-start text-dark-emphasis">
              <h1>
                Compete and Conquer!
              </h1>
              <p class="opacity-75">
                Dive into the World of Online Ping Pong
              </p>
            </div>
          </div>
        </div>
        <div class="carousel-item">
          <div class="carousel-page"></div>
          <div class="container">
            <div class="carousel-caption text-dark-emphasis">
              <h1>
                Pong and Chat, All in One Place!
              </h1>
              <p>
                Enhance Your Pong Experience with Live Chat!
              </p>
            </div>
          </div>
        </div>
        <div class="carousel-item">
          <div class="carousel-page"></div>
          <div class="container">
            <div class="carousel-caption text-end text-dark-emphasis">
              <h1>
                Are You Ready to Dominate?
              </h1>
              <p>
                Experience the Thrills of Pong Tournaments
              </p>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    `

    return `
    ${carousel}
    <hr>
    ${await this.getPlatformUsers()}
    `
  }
}