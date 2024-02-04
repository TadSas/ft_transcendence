import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Pong")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    const onclick = `
    import('./static/js/controllers/PongController.js').then(module => module.PongController.initPong())
    `

    return `
    <button type="button" class="btn btn-outline-secondary" onclick="${onclick}">
      Start pong
    </button>
    `
  }
}
