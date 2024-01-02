import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Login")
  }

  toggleContainer() {
    const loginCont = document.getElementById("login")

    if (loginCont.classList.contains("d-none"))
      loginCont.classList.remove("d-none")
  }

  async getContent() {
    this.getColorMode()
    this.toggleContainer()

    return `
      <div class="d-flex align-items-center py-4 bg-body-tertiary  vh-100">
        <main class="form-signin w-100 m-auto">
          <form action="submit()">
            <i class="bi bi-bootstrap"></i>
            <h1 class="h3 mb-3 fw-normal">Please sign in</h1>
        
            <div class="form-floating">
              <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
              <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating">
              <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
              <label for="floatingPassword">Password</label>
            </div>
        
            <div class="form-check text-start my-3">
              <input class="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault">
              <label class="form-check-label" for="flexCheckDefault">
                Remember me
              </label>
            </div>
            <button class="btn btn-primary w-100 py-2" type="submit">Sign in</button>
            <p class="mt-5 mb-3 text-body-secondary">© 2017–2023</p>
          </form>
        </main>
      </div>
    `
  }
}