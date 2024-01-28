import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Profile")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    const userInformationHeaders = {
      'login': 'Username',
      'first_name': 'Name',
      'last_name': 'Surname',
      'email': 'Email',
      'created_at': 'Join date'
    }

    const user = await new httpRequest({resource: 'auth/api/user', method: 'GET', successCallback: response => {return response}}).send()
    const userInformation = user['data']

    const generalInformation = `
    <div class="position-relative p-5 text-start bg-body border border-dashed rounded-4 mb-5">
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
    <div class="position-relative p-5 text-start bg-body border border-dashed rounded-4 mb-5">
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
    <div class="position-relative p-5 text-start bg-body border border-dashed rounded-4 mb-5">
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

    const friends = `
    <div class="position-relative p-5 text-start bg-body border border-dashed rounded-4 mb-5">
      <h3 class="border-bottom pb-2">Friends</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container text-center">
          <div class="row">

            <div class="col-2 col-sm-2 d-flex justify-content-center">
              <div class="px-2">
                <!-- <img width="64" height="64" class="rounded-circle border"> -->
                <i class="bi bi-person-arms-up h1"></i>
                <p class="text-center text-wrap">No friends found</p>
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

    return `
    <div class="container">
      <div class="row flex-lg-row align-items-start g-5 py-5">

        <div class="col-lg-4">
          <div class="position-relative p-5 text-center bg-body border border-dashed rounded-4">
            <img src="/auth/api/avatar" width="256px" height="256px" class="rounded-circle border object-fit-cover">
            <h1>username</h1>
            <span class="badge rounded-pill text-bg-${statuses[status || 'offline']}">
              <span class="align-middle">Status: ${status}</span>
              <span class="spinner-grow spinner-grow-sm align-middle"></span>
            </span>
          </div>
        </div>

        <div class="col-lg-8">
          ${generalInformation}
          ${stats}
          ${tournaments}
          ${friends}
        </div>

      </div>
    </div>
    `
  }
}