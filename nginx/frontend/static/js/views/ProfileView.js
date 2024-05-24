import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.username = params.username

    this.setTitle("Profile")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)
    this.viewEventStore.push({
      'click': {
        'document.getElementById("startUserChat")': e => {
          MessagesController.createRoom(this.username)
        },
        'document.getElementById("friendAction")': e => {
          FriendsController.friendAction(e, this.username)
        }
      }
    })

    const user = await new httpRequest({
      resource: this.username ? `/auth/api/user/${this.username}` : '/auth/api/user',
      method: 'GET',
      successCallback: response => {return response}
    }).send()
    const userInformation = user['data']

    const statuses = {
      'online': 'success',
      'offline': 'danger',
    }

    let status = 'offline'
    const login = userInformation['login'] || ''

    if (window.userActivity['online'].includes(login))
      status = 'online'

    const avatarSrc = this.username ? `/auth/api/avatar/${login}`: '/auth/api/avatar'

    return `
    <div class="container">
      <div class="row flex-lg-row align-items-start g-5 py-5">

        <div class="col-4 px-2">
          <div class="position-relative p-5 text-center bg-body border rounded-4">
            <div class="avatar-container">
              <img src="${avatarSrc}" class="rounded-circle border object-fit-cover w-100 h-100 aspect-ratio-1-1">
            </div>
            <h1>${login}</h1>
            <div class="pb-3">
              <span class="badge rounded-pill text-bg-${statuses[status || 'offline']}">
                <span class="align-middle">Status: ${status}</span>
                ${status === 'online' ? '<span class="spinner-grow spinner-grow-sm align-middle"></span>': ''}
              </span>
            </div>
            ${
              this.username && this.username !== window.user.login  ? `
              <hr class="mt-0">
              <div id="startUserChat" class="d-inline-block me-2 mb-3">
                <div role="button" class="btn btn-outline-success">
                  Chat
                  <a href="/messages" type="button" class="pe-none d-none" data-link></a>
                </div>
              </div>
              <div id="friendAction" class="d-inline-block me-2 mb-3">
                ${await FriendsController.status(this.username)}
              </div>
              <hr class="mt-0">
              <a id="startUserPong" type="button" class="btn btn-outline-secondary" onclick="PongController.createPongGameModal('${this.username}')">
                Play Pong
              </a>
              ` : ''
            }
          </div>
        </div>

        <div class="col-8 px-1">
          ${await this.getGeneralInformation(userInformation)}

          ${
            this.username ? '' : `
            <div id="friendRequests">
              ${await FriendsController.getFriendRequestsView(userInformation)}
            </div>
            `
          }
          <div id="friends">
            ${await FriendsController.getFriendsView(this.username)}
          </div>

          <div id="stats">
            ${await PongController.getProfileStatsView(userInformation)}
          </div>

          <div id="matchHistory">
            ${await PongController.getProfileMatchHistoryView(userInformation)}
          </div>

          <div id="tournaments">
            ${await TournamentsController.getProfileTournamnetsView(userInformation)}
          </div>

        </div>

      </div>
    </div>
    `
  }

  async getGeneralInformation(userInformation) {
    const userInformationHeaders = {
      'login': 'Username',
      'first_name': 'Name',
      'last_name': 'Surname',
      'email': 'Email',
      'created_at': 'Join date'
    }

    return `
    <div class="position-relative p-5 text-start bg-body border rounded-4 mb-3">
      <h3 class="text-body-emphasis border-bottom pb-2">General information</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container text-center">
          ${
            (() => {
              let content = ''

              for (const header in userInformationHeaders) {
                content += `
                <div class="row">

                  <div class="col-4 col-sm-4">
                    <div class="px-2">
                      <p class="text-start text-wrap fw-bold">${userInformationHeaders[header] || ''}</p>
                    </div>
                  </div>
                  <div class="col-8 col-sm-8">
                    <div class="px-2">
                      <p class="text-start text-wrap fw-light">${userInformation[header] || ''}</p>
                    </div>
                  </div>
                  <hr>
                </div>
                `
              }

              return content
            })()
          }
        </div>
      </div>
    </div>
    `
  }
}
