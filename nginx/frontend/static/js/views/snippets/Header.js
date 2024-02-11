import BaseSnippet from "./BaseSnippet.js"


export default class extends BaseSnippet {
  constructor() {
    super()
  }

  getEvents() {
    return {}
  }

  getSnippet() {
    const theme = `
    <div id="theme">
      <div class="dropdown me-3">
        <button class="btn btn-bd-primary dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label="Toggle theme (dark)">
          <i class="bi bi-moon-stars-fill theme-icon-active"></i>
          <span class="visually-hidden" id="bd-theme-text">Toggle theme</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text" style="">
          <li>
            <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="light" aria-pressed="false">
              <i class="bi bi-sun-fill me-2 opacity-50 theme-icon"></i>
              Light
              <i class="bi bi-check2 ms-auto d-none"></i>
            </button>
          </li>
          <li>
            <button type="button" class="dropdown-item d-flex align-items-center active" data-bs-theme-value="dark" aria-pressed="true">
              <i class="bi bi-moon-stars-fill me-2 opacity-50 theme-icon"></i>
              Dark
              <i class="bi bi-check2 ms-auto d-none"></i>
            </button>
          </li>
          <li>
            <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="auto" aria-pressed="false">
              <i class="bi bi-circle-half me-2 opacity-50 theme-icon"></i>
              Auto
              <i class="bi bi-check2 ms-auto d-none"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
    `

    return `
      <div class="container-fluid d-grid gap-3 align-items-center" style="grid-template-columns: 1fr 2fr;">
        <div class="dropdown">
          <a id="sidebar-collapse" class="link-body-emphasis" style="position: fixed; margin-left: -35px; margin-top: -15px;">
            <i class="bi bi-arrow-left-circle-fill h3"></i>
          </a>
        </div>
        <div class="d-flex align-items-center">
          <form class="w-100 me-3" role="search">
            <input type="search" class="form-control" placeholder="Search..." aria-label="Search">
          </form>
          ${theme}
          <div class="flex-shrink-0 dropdown">
            <a class="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <img id="headerUserAvatar" src="/auth/api/avatar" alt="mdo" width="32" height="32" class="rounded-circle object-fit-cover">
            </a>
            <ul id="userAvatarDropdown" class="dropdown-menu shadow" style="">
              <li>
                <a class="dropdown-item" href="/settings" data-link>Settings</a>
              </li>
              <li>
                <a class="dropdown-item" href="/profile" data-link>Profile</a>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <a class="dropdown-item" href="/logout" data-link>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `
  }
}
