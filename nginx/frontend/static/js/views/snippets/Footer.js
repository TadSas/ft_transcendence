import BaseSnippet from "./BaseSnippet.js";


export default class extends BaseSnippet {
  constructor() {
      super();
  }

  getEvents() {
    return {}
  }

  getSnippet() {
    return `
      <div class="col-md-4 d-flex align-items-center">
        <a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1" data-link>
          <svg class="bi" width="30" height="24">
            <use xlink:href="#bootstrap"></use>
          </svg>
        </a>
        <span class="mb-3 mb-md-0 text-body-secondary">© 2023 Company, Inc</span>
      </div>
      <ul class="nav col-md-4 justify-content-end list-unstyled d-flex">
        <li class="ms-3">
          <a class="text-body-secondary" href="/" data-link>
            <svg class="bi" width="24" height="24">
              <use xlink:href="#twitter"></use>
            </svg>
          </a>
        </li>
        <li class="ms-3">
          <a class="text-body-secondary" href="/" data-link>
            <svg class="bi" width="24" height="24">
              <use xlink:href="#instagram"></use>
            </svg>
          </a>
        </li>
        <li class="ms-3">
          <a class="text-body-secondary" href="/" data-link>
            <svg class="bi" width="24" height="24">
              <use xlink:href="#facebook"></use>
            </svg>
          </a>
        </li>
      </ul>
    `
  }
}
