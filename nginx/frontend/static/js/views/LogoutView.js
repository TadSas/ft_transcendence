import LoginView from "./LoginView.js"


export default class extends LoginView {
  constructor(params) {
    super(params)
    this.cleanUpDOM()

    LogoutController.logout()
  }

  cleanUpDOM() {
    ['sidebar', 'header', 'game', 'content', 'footer'].forEach((element) => {
      document.getElementById(element).innerHTML = ''
    })
  }
  
  toggleContainer() {
    const loggedCont = document.getElementById("logged")

    if (!loggedCont.classList.contains("d-none"))
      loggedCont.classList.add("d-none")

    super.toggleContainer()
  }
}