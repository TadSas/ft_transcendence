import BaseSnippet from "./BaseSnippet.js"


export default class extends BaseSnippet {
  constructor() {
    super()
  }

  getEvents() {
    return {
      "click": {
        'document.getElementById("sidebar-collapse")': e => {
          if (window.innerWidth < 768)
            return

          document.querySelector("#sidebar-collapse i").classList.toggle("bi-arrow-right-circle-fill")
          document.getElementById("sidebar").classList.toggle("active")
          Array.from(document.getElementsByClassName("sidebar-title-transition")).forEach(element => {
              element.classList.toggle("d-none")
          })
        }
      }
    }
  }

  getSnippet(routes, match) {
    return `
      <div class="d-flex flex-column flex-shrink-0 py-3 ps-3 pe-4 bg-body-tertiary vh-100">
        <a href="/" id="sidebarTitle" class="d-flex mx-3 align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none" data-link>
          <i class="bi bi-asterisk pe-none me-2 margin-13px"></i>
          <span class="fs-4 sidebar-title-transition">Squeeze</span>
        </a>
        <hr>
        <ul id="navigation-list" class="nav flex-column mb-auto nav-pills">
          ${
            Object.values(routes).map(
            route => {
              return route.sideBar ? `
              <li class="nav-item" id="nav-${route.id}">
                <a href="${route.path}" class="nav-link ${route.path === match ? 'active' : 'link-body-emphasis'}" data-link>
                  <i class="bi bi-${route.icon} pe-none"></i>
                  <span class="ms-2 sidebar-title-transition">${route.name}</span>
                </a>
              </li>` : ''
            }).join('')
          }
        </ul>
      </div>
    `
  }
}
