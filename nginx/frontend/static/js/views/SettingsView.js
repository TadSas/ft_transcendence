import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Settings")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    const userInformationHeaders = {
      'first_name': {'label': 'Name', 'type': Components.text},
      'last_name': {'label': 'Surname', 'type':  Components.text},
      'email': {'label': 'Email', 'type':  Components.email},
      'two_factor_enabled': {'label': 'Two facto authentication', 'type': Components.checkbox}
    }

    const user = await new httpRequest({resource: 'auth/api/user', method: 'GET', successCallback: response => {return response}}).send()
    const userInformation = user['data']

    const generalInformation = `
    <div class="position-relative p-5 text-start bg-body border border-dashed rounded-4 mb-5">
      <h3 class="text-body-emphasis border-bottom pb-2">General information</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div id="userSettings" class="container text-center">
          ${
            (() => {
              let content = ''

              for (const header in userInformationHeaders) {
                content += `
                <div class="row d-flex align-items-center">
                  <div class="col-4 col-sm-4 d-flex">
                    <div class="px-2">
                      ${Components.label({'labelText': userInformationHeaders[header]['label'] || '', 'labelFor': header})}
                    </div>
                  </div>
                  <div class="col-8 col-sm-8">
                    <div class="px-2">
                      ${userInformationHeaders[header]['type']({'id': header, 'placeholder': userInformation[header] || ''})}
                    </div>
                  </div>
                </div>
                <hr>
                `
              }

              return content
            })()
          }
          <div class="d-flex align-items-start">
            ${Components.button({'buttonLabel': 'Submit', 'js': {'onclick': "SettingsController.submit('userSettings')"}})}
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
            <div class="avatar-container">
              <img id="userAvatar" src="/auth/api/avatar" width="256px" height="256px" class="rounded-circle border object-fit-cover" onclick="SettingsController.triggerAvatarUpload('userAvatarInput')">
              <div class="overlay d-flex justify-content-center align-items-center pe-none">
                <i class="bi bi-pencil-square h3 pe-none"></i>
              </div>
            </div>
            ${Components.file({'id': 'userAvatarInput', 'hide': true, 'js': {'onchange': `SettingsController.uploadAvatar('userAvatarInput','userAvatar')`}})}
            <h1>username</h1>
            <span class="badge rounded-pill text-bg-${statuses[status || 'offline']}">
              <span class="align-middle">Status: ${status}</span>
              <span class="spinner-grow spinner-grow-sm align-middle"></span>
            </span>
          </div>
        </div>

        <div class="col-lg-8">
          ${generalInformation}
        </div>

      </div>
    </div>
    `
  }
}