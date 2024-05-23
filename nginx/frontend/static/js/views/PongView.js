import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.matchId = params.matchId || ''

    this.setTitle("Pong")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    const matchObject = this.matchId ? await PongController.getMatch(this.matchId) : {}

    this.matchId && PongController.initPong(matchObject)

    return `
    <div class="row overflow-hidden mx-0">
      <div class="col-2 px-0">
        <div class="p-3 vh-80 overflow-x-scroll bg-opacity-50 border rounded me-1">
        ${this.matchId ? this.initNotificationSection(matchObject) : ''}
        </div>
      </div>
      <div class="col-8 px-0">
        <div class="px-2 vh-10 overflow-x-scroll bg-opacity-50 border rounded me-1 d-flex align-items-center">
          <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap" rel="stylesheet">
          <div id="scroll-container">
            <div id="scroll-text">
              🎾 The battle is on! Witness two pong masters go head-to-head in an electrifying match! 🏆 Let's go players! Show us your skills and make every shot count! 🙌
            </div>
          </div>
        </div>

        <div id="pongCont" class="p-3 vh-60 overflow-x-scroll bg-opacity-50 border rounded me-1 d-flex justify-content-center align-items-center ${this.matchId ? 'd-none' : ''}">
          ${
            this.matchId ? '' : `
            <a role="button" class="btn btn-outline-secondary" onclick="PongController.createPongGame(this)" data-participant="${window.user.login}">Start a single game</a>
            `
          }
        </div>
        <div id="pongWaintingCont" class="p-3 vh-60 overflow-x-scroll bg-opacity-50 border rounded me-1 d-flex justify-content-center align-items-center ${this.matchId ? '' : 'd-none'}">
          ${
            this.matchId ? `
            <div class="container text-center">
              <div class="justify-content-center mb-3">
                <div class="spinner-grow spinner-grow-sm mx-1" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm mx-1" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm mx-1" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div class="row justify-content-center">
                <strong>We are waiting for all parties to be ready to start the game.</strong>
              </div>
            </div>
            ` : ''
          }
        </div>
        <div id="pongDisconnectCont" class="p-3 vh-60 overflow-x-scroll bg-opacity-50 border rounded me-1 d-flex justify-content-center align-items-center d-none">
            <div class="container text-center">
              <div class="justify-content-center mb-3">
                <div class="spinner-grow spinner-grow-sm mx-1" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm mx-1" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm mx-1" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div class="row justify-content-center">
                <strong>It seems your opponent has left the game or switched to another tab. Please wait to continue playing.</strong>
              </div>
            </div>
        </div>
        <div id="pongResultCont" class="p-3 vh-60 overflow-x-scroll bg-opacity-50 border rounded me-1 d-flex justify-content-center align-items-center d-none">
          <div class="container text-center">
            <div class="justify-content-center">
              <p class="fs-4">
                <strong>Final result is </strong>
                <strong id="pongResultScore"></strong>
              </p>
            </div>
            <hr>
            <div class="row justify-content-center">
              <p class="fs-4">
                <strong id="pongResultMessage"></strong>
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 vh-10 overflow-x-scroll bg-opacity-50 border rounded me-1 d-flex justify-content-center align-items-center">
        </div>
      </div>
      <div class="col-2 px-0">
        <div class="p-3 vh-80 overflow-x-scroll bg-opacity-50 border rounded me-1"></div>
      </div>
    </div>
    `
  }

  initNotificationSection = (matchObject) => {
    return `
    <div id="pongNotifyOpponent">
      <div class="d-grid">
        <button class="btn btn-outline-secondary" type="button" onclick="PongController.notifyPlayer('${encodeURIComponent(JSON.stringify(matchObject))}')">
          <i class="bi bi-bell-fill me-2"></i> Notify your opponent
        </button>
      </div>
    </div>
    `
  }

  initReadyView = (matchObject) => {
    const readyButtons = []
    const players = matchObject.players

    if (players[0] == window.user.login)
      readyButtons.push(
        `<button type="button" class="btn btn-secondary me-5" onclick="PongController.gameInstance.insertGamecanvas()">
          ${players[0]}
          <span class="bi bi-question-circle" aria-hidden="true"></span>
        </button>`
    )
    else
      readyButtons.push(
        `<button type="button" class="btn btn-secondary me-5" disabled>
          <span class="me-2" role="status">${players[0]}</span>
          <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        </button>`
      )

    if (players[1] == window.user.login)
      readyButtons.push(
        `<button type="button" class="ms-5 btn btn-secondary" onclick="PongController.gameInstance.insertGamecanvas()">
          <span class="bi bi-question-circle me-2" aria-hidden="true"></span>
          ${players[1]}
        </button>`
      )
    else
      readyButtons.push(
        `<button type="button" class="ms-5 btn btn-secondary" disabled>
        <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        <span role="status">${players[1]}</span>
        </button>`
      )

    return readyButtons.join('')
  }
}
