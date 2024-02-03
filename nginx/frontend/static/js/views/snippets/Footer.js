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
          <i class="bi bi-asterisk"></i>
        </a>
        <span class="mb-3 mb-md-0 text-body-secondary">© 2024 Squeeze, Inc</span>
      </div>
      <ul class="nav col-md-8 justify-content-end">

        <li class="nav-item">
          <a href="https://profile.intra.42.fr/users/stadevos" class="nav-link px-2 text-body-secondary" target="_blank">
            <img src="static/images/fortytwo.svg" height="21">
            stadevos
          </a>
        </li>

        <li class="nav-item">
          <a href="https://profile.intra.42.fr/users/syeghiaz" class="nav-link px-2 text-body-secondary" target="_blank">
            <img src="static/images/fortytwo.svg" height="21">
            syeghiaz
          </a>
        </li>

        <li class="nav-item">
          <a href="https://profile.intra.42.fr/users/dmartiro" class="nav-link px-2 text-body-secondary" target="_blank">
            <img src="static/images/fortytwo.svg" height="21">
            dmartiro
          </a>
        </li>

        <li class="nav-item">
          <a href="https://profile.intra.42.fr/users/ergrigor" class="nav-link px-2 text-body-secondary" target="_blank">
            <img src="static/images/fortytwo.svg" height="21">
            ergrigor
          </a>
        </li>

        <li class="nav-item">
          <a class="nav-link px-2 text-body-secondary">
            <img src="static/images/fortytwo.svg" height="21">
            who?
          </a>
        </li>

      </ul>
    `
  }
}
