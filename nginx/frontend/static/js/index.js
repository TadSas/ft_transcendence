import Posts from "./views/Posts.js"
import PostView from "./views/PostView.js"
import Settings from "./views/Settings.js"
import Dashboard from "./views/Dashboard.js"

import setupColorMode from "./setupColorMode.js"


const routes = [
    { path: "/", view: Dashboard, name: "Dashboard", icon: "home" },
    { path: "/posts", view: Posts, name: "Posts", icon: "grid" },
    // { path: "/posts/:id", view: PostView, name: "Posts", icon: "grid" },
    { path: "/settings", view: Settings, name: "Settings", icon: "speedometer2" }
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
 
    document.querySelector("#content").innerHTML = await view.getContent(routes, match.route.path)

    setupColorMode()
}

window.addEventListener("popstate", router)

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            navigateTo(e.target.href)
        }
    })
    router()
})