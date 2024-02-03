import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Pong")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    return `
      <h1>Pong</h1>
      <p>You are viewing the Pong game!</p>
    `
  }
}