import BaseSnippet from "./BaseSnippet.js";


export default class extends BaseSnippet {
  constructor() {
      super();
  }

  getEvents() {
    return {}
  }

  getSnippet(routes, match) {
    return `
      <div class="container-fluid d-grid gap-3 align-items-center" style="grid-template-columns: 1fr 2fr;">
        <div class="dropdown">
          <button type="button" id="sidebar-collapse" class="border rounded-3 p-1 text-decoration-none"
            <i class="bi bi-list bi-lg py-2 p-1"></i>
            Menu
          </button>
        </div>
        <div class="d-flex align-items-center">
          <form class="w-100 me-3" role="search">
            <input type="search" class="form-control" placeholder="Search..." aria-label="Search">
          </form>
          <div class="flex-shrink-0 dropdown">
            <a href="/" class="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-link>
              <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" class="rounded-circle">
            </a>
            <ul class="dropdown-menu text-small shadow" style="">
              <li>
                <a class="dropdown-item" href="/" data-link>New project...</a>
              </li>
              <li>
                <a class="dropdown-item" href="/" data-link>Settings</a>
              </li>
              <li>
                <a class="dropdown-item" href="/" data-link>Profile</a>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <a class="dropdown-item" href="/" data-link>Sign out</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `
  }
}
