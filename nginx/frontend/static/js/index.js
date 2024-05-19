import Pong from "./views/PongView.js"
import Login from "./views/LoginView.js"
import Logout from "./views/LogoutView.js"
import Profile from "./views/ProfileView.js"
import Messages from "./views/MessagesView.js"
import Settings from "./views/SettingsView.js"
import Dashboard from "./views/DashboardView.js"
import Tournaments from "./views/TournamentsView.js"

import PongGame from "./src/PongGame.js"
import setupColorMode from "./src/ColorMode.js"


window.PongGame = PongGame

const routes = [
  {path: "/", view: Dashboard, id: "dashboard", name: "Dashboard", icon: "house-door", sideBar: true},
  {path: "/login", view: Login, name: "Login", container: "login", sideBar: false},
  {path: "/logout", view: Logout, name: "Login", container: "login", sideBar: false},
  {path: "/pong", view: Pong, id: "pong", name: "Pong", icon: "rocket-takeoff", sideBar: true},
  {path: "/pong/:matchId", view: Pong, name: "Pong", sideBar: false},
  {path: "/messages", view: Messages, id: "messages", name: "Messages", icon: "chat", sideBar: true},
  {path: "/tournaments", view: Tournaments, id: "matches-tournaments", name: "Games / Tournaments", icon: "trophy", sideBar: true},
  {path: "/profile", view: Profile, id: "profile", name: "Profile", icon: "person-circle", sideBar: true},
  {path: "/profile/:username", view: Profile, name: "Profile", sideBar: false},
  {path: "/settings", view: Settings, id: "settings", name: "Settings", icon: "speedometer2", sideBar: true},
]

const pathToRegex = path => {
  return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$")
}

const getParams = match => {
  const values = match.result.slice(1)
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1])

  return Object.fromEntries(keys.map((key, i) => {
    return [key, values[i]]
  }))
}

const navigateTo = url => {
  history.pushState(null, null, url)
  router()
}

const router = async () => {
  const potentialMatches = routes.map(route => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path))
    }
  })

  let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null)

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname]
    }
  }

  const view = new match.route.view(getParams(match))
  const matchedRoute = match.route

  document.querySelector(`#${matchedRoute.container || 'content'}`).innerHTML = await view.getContent(routes, matchedRoute.path)
  view.registerEvents(view.viewEventStore)

  setupColorMode()
}

window.addEventListener("popstate", router)

document.addEventListener("DOMContentLoaded", () => {
  if (LoginController.authenticationCheck().authenticated) {
    history.pushState(null, null, '/')
    NotificationController.init()
  }
  else {
    history.pushState(null, null, `/login`)
  }

  router()

  document.body.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault()

      if (location.href !== e.target.href)
        navigateTo(e.target.href)
    }
  })
})