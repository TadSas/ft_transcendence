import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Messages")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    return `
      <h1>Messages</h1>
      <p>You are viewing your Messages!</p>
    `
  }
}