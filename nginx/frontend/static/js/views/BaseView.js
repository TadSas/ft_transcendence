import Header from "./snippets/Header.js"
import Footer from "./snippets/Footer.js"
import Sidebar from "./snippets/Sidebar.js"


export default class {
  constructor(params) {
    this.eventStore = []
    this.viewEventStore = []
    this.params = params
  }

  setTitle(title) {
    document.title = `Squeeze: ${title}`
  }

  async getContent() {
    return ""
  }

  registerEvents(eventStore = []) {
    switch (document.readyState) {
      case "loading":
        console.log("The document is loading.")
        break
      case "interactive": {
        console.log("The document has finished loading and we can access DOM elements.")
        break
      }
      case "complete":
        console.log("The page is fully loaded.")
        break
    }
    eventStore.forEach(events => {
      Object.entries(events).forEach(([eventType, eventList]) => {
        Object.entries(eventList).forEach(([element, event]) => {
          eval(element).addEventListener(eventType, event)
        })
      })
    })
  }

  getSidebar(routes, match) {
    const sidebarSnippet = new Sidebar
    const sidebarElement = document.getElementById("sidebar")

    if (sidebarElement.innerHTML === '') {
      sidebarElement.innerHTML = sidebarSnippet.getSnippet(routes, match)
      this.eventStore.push(sidebarSnippet.getEvents())
    }
  }

  getHeader() {
    const headerSnippet = new Header
    const headerElement = document.getElementById("header")

    if (headerElement.innerHTML === '') {
      headerElement.innerHTML = headerSnippet.getSnippet()
      this.eventStore.push(headerSnippet.getEvents())
    }
  }

  getFooter() {
    const footerSnippet = new Footer
    const footerElement = document.getElementById("footer")

    if (footerElement.classList.contains('d-none'))
      footerElement.classList.remove('d-none')

    if (footerElement.innerHTML === '') {
      footerElement.innerHTML = footerSnippet.getSnippet()
      this.eventStore.push(footerSnippet.getEvents())
    }
  }

  toggleContainer() {
    const loggedCont = document.getElementById("logged")

    if (loggedCont.classList.contains("d-none"))
      loggedCont.classList.remove("d-none")
  }

  getBase(routes, match) {
    this.toggleContainer()
    this.getSidebar(routes, match)
    this.getHeader()
    this.getFooter()

    this.registerEvents(this.eventStore)
  }
}