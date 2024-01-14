import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Posts")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    return `
      <h1>Posts</h1>
      <p>You are viewing the posts!</p>
    `
  }
}