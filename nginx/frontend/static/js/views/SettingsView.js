import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Settings")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    return `
      <h1>Settings</h1>
      <p>Manage your privacy and configuration.</p>
    `
  }
}