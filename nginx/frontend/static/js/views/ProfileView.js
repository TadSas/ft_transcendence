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

    const userInformationHeaders = {
      'login': 'Username',
      'first_name': 'Name',
      'last_name': 'Surname',
      'email': 'Email',
      'created_at': 'Join date'
    }

    const resource = this.username ? `/auth/api/user/${this.username}` : '/auth/api/user'
    const user = await new httpRequest({resource: resource, method: 'GET', successCallback: response => {return response}}).send()
    const userInformation = user['data']

    const generalInformation = `
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

    const stats = `
    <div class="position-relative p-5 text-start bg-body border rounded-4 mb-3">
      <h3 class="border-bottom pb-2">Stats</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container text-center">
          <div class="row">

            <div class="col-4 col-sm-4 d-flex justify-content-center">
              <div class="px-2">
                <i class="bi bi-controller h1"></i>
                <p class="text-center text-wrap">Played: N/A</p>
              </div>
            </div>

            <div class="col-4 col-sm-4 d-flex justify-content-center">
              <div class="px-2">
                <i class="bi bi-emoji-laughing h1"></i>
                <p class="text-center text-wrap">Won: N/A</p>
              </div>
            </div>

            <div class="col-4 col-sm-4 d-flex justify-content-center">
              <div class="px-2">
                <i class="bi bi-emoji-frown h1"></i>
                <p class="text-center text-wrap">Lost: N/A</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    `

    const tournaments = `
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

    const statuses = {
      'online': 'success',
      'offline': 'danger',
      'in-game': 'warning'
    }
    const status = userInformation['status'] || ''
    const login = userInformation['login'] || ''
    const avatarSrc = this.username ? `/auth/api/avatar/${login}`: '/auth/api/avatar'

    return `
    <div class="container">
      <div class="row flex-lg-row align-items-start g-5 py-5">

        <div class="col-4 px-2">
          <div class="position-relative p-5 text-center bg-body border rounded-4">
            <div class="avatar-container">
              <img src="${avatarSrc}" class="rounded-circle border object-fit-cover w-100 h-100">
            </div>
            <h1>${login}</h1>
            <div class="pb-3">
              <span class="badge rounded-pill text-bg-${statuses[status || 'offline']}">
                <span class="align-middle">Status: ${status}</span>
                ${['online', 'in-game'].includes(status) ? '<span class="spinner-grow spinner-grow-sm align-middle"></span>': ''}
              </span>
            </div>
            ${
              this.username ? `
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
              <div id="startUserPong" role="button" class="btn btn-outline-light me-2 mb-3">
                Pong
                <a href="/pong" type="button" class="pe-none d-none" data-link></a>
              </div>
              ` : ''
            }
          </div>
        </div>

        <div class="col-8 px-1">
          ${generalInformation}
          <div id="stats">
            ${stats}
          </div>
          <div id="tournaments">
            ${tournaments}
          </div>
          ${
            this.username ? '' : `
            <div id="friendRequests">
              ${await FriendsController.getFriendRequestsView()}
            </div>
            `
          }
          <div id="friends">
            ${await FriendsController.getFriendsView()}
          </div>
        </div>

      </div>
    </div>
    `
  }
}