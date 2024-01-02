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
      <div class="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
        <button class="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label="Toggle theme (dark)">
          <i class="bi bi-moon-stars-fill my-1 theme-icon-active"></i>
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
    `
  }
}
