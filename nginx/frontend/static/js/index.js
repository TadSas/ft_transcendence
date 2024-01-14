import Login from "./views/LoginView.js"
import Posts from "./views/PostsView.js"
import PostView from "./views/PostView.js"
import Settings from "./views/SettingsView.js"
import Dashboard from "./views/DashboardView.js"

import setupColorMode from "./src/ColorMode.js"


const routes = [
  {path: "/", view: Dashboard, name: "Dashboard", icon: "house-door", sideBar: true},
  {path: "/login", view: Login, name: "Login", icon: "box-arrow-in-right", container: "login", sideBar: false},
  {path: "/posts", view: Posts, name: "Posts", icon: "grid", sideBar: true},
  // {path: "/posts/:id", view: PostView, name: "Posts", icon: "grid", sideBar: false},
  {path: "/settings", view: Settings, name: "Settings", icon: "speedometer2", sideBar: true}
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
  if (localStorage.getItem('logged') === null && location.pathname !== '/login')
    location.href = `${location.origin}/login`
  else
    router()

  document.body.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault()
      navigateTo(e.target.href)
    }
  })
})