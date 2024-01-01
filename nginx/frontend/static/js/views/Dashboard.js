import BaseView from "./BaseView.js";


export default class extends BaseView {
    constructor(params) {
        super(params);
        this.setTitle("Dashboard");
    }

    async getContent(routes, match) {
        this.getBase(routes, match)

        return `
            <h1>Dashboard</h1>
            <p>You are viewing the dashboard!</p>
        `;
    }
}