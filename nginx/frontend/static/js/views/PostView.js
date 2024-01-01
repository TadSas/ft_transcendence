import BaseView from "./BaseView.js";


export default class extends BaseView {
    constructor(params) {
        super(params);
        this.postId = params.id;
        this.setTitle("Viewing Post");
    }

    async getContent(routes, match) {
        this.getBase(routes, match)

        return `
            <h1>Post</h1>
            <p>You are viewing post #${this.postId}.</p>
        `;
    }
}
