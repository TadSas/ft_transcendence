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
        },
        'document.getElementById("navigation-list")': e => {
          document.getElementById("navigation-list").getElementsByClassName("active")[0].setAttribute("class", "nav-link link-body-emphasis")
          e.target.setAttribute("class", "nav-link active")
        }
      }
    }
  }

  getSnippet(routes, match) {
    return `
      <div class="d-flex flex-column flex-shrink-0 p-3 bg-body-tertiary vh-100">
        <a href="/" class="d-flex mx-3 align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none" data-link>
          <i class="bi bi-bootstrap-fill pe-none me-2"></i>
          <span class="fs-4 sidebar-title-transition">Sidebar title</span>
        </a>
        <hr>
        <ul id="navigation-list" class="nav flex-column mb-auto nav-pills">
          ${
            Object.values(routes).map(
            route => {
              return route.sideBar ? `
              <li class="nav-item">
                <a href="${route.path}" class="nav-link ${route.path === match ? 'active' : 'link-body-emphasis'}" data-link>
                  <i class="bi bi-${route.icon} pe-none me-2"></i>
                  <span class="sidebar-title-transition">${route.name}</span>
                </a>
              </li>` : ''
            }).join('')
          }
        </ul>
      </div>
    `
  }
}