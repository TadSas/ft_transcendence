import BaseSnippet from "./BaseSnippet.js"


export default class extends BaseSnippet {
  constructor() {
    super()
  }

  getEvents() {
    return {}
  }

  getSnippet() {
    return `
      <div class="col-md-4 d-flex align-items-center">
        <a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1" data-link>
          <i class="bi bi-bootstrap"></i>
        </a>
        <span class="mb-3 mb-md-0 text-body-secondary">© 2023 Company, Inc</span>
      </div>
      <ul class="nav col-md-4 justify-content-end list-unstyled d-flex">
        <li class="ms-3">
          <a class="text-body-secondary" href="/" data-link>
            <i class="bi bi-twitter-x"></i>
          </a>
        </li>
        <li class="ms-3">
          <a class="text-body-secondary" href="/" data-link>
            <i class="bi bi-instagram"></i>
          </a>
        </li>
        <li class="ms-3">
          <a class="text-body-secondary" href="/" data-link>
            <i class="bi bi-facebook"></i>
          </a>
        </li>
      </ul>
    `
  }
}
