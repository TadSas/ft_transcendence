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
      <div class="container-fluid d-grid gap-3 align-items-center" style="grid-template-columns: 1fr 2fr;">
        <div class="dropdown">
          <a id="sidebar-collapse" class="link-body-emphasis" data-link style="position: fixed; margin-left: -35px; margin-top: -15px;">
            <i class="bi bi-arrow-left-circle-fill h3"></i>
          </a>
        </div>
        <div class="d-flex align-items-center">
          <form class="w-100 me-3" role="search">
            <input type="search" class="form-control" placeholder="Search..." aria-label="Search">
          </form>
          <div class="flex-shrink-0 dropdown">
            <a href="/" class="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-link>
              <img src="/auth/api/avatar" alt="mdo" width="32" height="32" class="rounded-circle">
            </a>
            <ul class="dropdown-menu shadow" style="">
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
