import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("AuthCallback")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    return `
      <h1>AuthCallback</h1>
    `
  }
}