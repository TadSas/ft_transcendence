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
    this.viewEventStore.push({
      'load': {
        'window': e => {
          const gradients = [
            {
              "direction": "90deg",
              "colors": ["#ff9a9e", "#fad0c4"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "90deg",
              "colors": ["#ff8177", "#ff867a", "#ff8c7f", "#f99185", "#cf556c", "#b12a5b"],
              "positions": ["0%", "0%", "21%", "52%", "78%", "100%"]
            },
            {
              "direction": "to right",
              "colors": ["#43e97b", "#38f9d7"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "120deg",
              "colors": ["#84fab0", "#8fd3f4"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "120deg",
              "colors": ["#f093fb", "#f5576c"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "to right",
              "colors": ["#fa709a", "#fee140"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "135deg",
              "colors": ["#667eea", "#764ba2"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "180deg",
              "colors": ["#2af598", "#009efd"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "to right",
              "colors": ["#6a11cb", "#2575fc"],
              "positions": ["0%", "100%"]
            },
            {
              "direction": "to top",
              "colors": ["#3f51b1", "#5a55ae", "#7b5fac", "#8f6aae", "#a86aa4", "#cc6b8e", "#f18271", "#f3a469", "#f7c978"],
              "positions": ["0%", "13%", "25%", "38%", "50%", "62%", "75%", "87%", "100%"]
            }
          ]

          const setBackgroundColor = color => {
            Array.from(document.querySelectorAll('.magical-underline')).forEach(el => {
              el.style.backgroundImage = color
            })
          }

          const buildGradient = gradientObj => {
            return `linear-gradient(${gradientObj.direction}, ${mergeArrays(gradientObj.colors, gradientObj.positions)})`
          }

          const randomNumber = max => {
            return Math.floor(Math.random() * (max - 1))
          }

          const mergeArrays = (arrOne, arrTwo) => {
            return arrOne.map((item, i) => `${item} ${arrTwo[i]}`).join(', ')
          }

          setBackgroundColor(
            buildGradient(
              gradients[randomNumber(gradients.length)]
            )
          )
        }
      }
    })

    return `
      <div class="d-flex align-items-center py-4 bg-body-tertiary  vh-100">
        <div class="container col-xl-10 col-xxl-8 px-4 py-5">
          <div class="row align-items-center g-lg-5 py-5">
            <div class="col-lg-7 text-center text-lg-start">
              <h1 class="display-4 fw-bold lh-1 text-body-emphasis mb-3">Welcome to the world of <span class="magical-underline">Pong</span></h1>
              <p class="col-lg-10 fs-4">Ready to take your Pong skills to the next level? Log in to your account and dive into the thrilling world of competitive Pong matches. Whether you're a seasoned player or just getting started, our platform offers a dynamic gaming experience that will keep you on the edge of your seat.</p>
            </div>
            <div class="col-md-10 mx-auto col-lg-5">
              <div id="login-form" class="p-4 p-md-5 border rounded-3 bg-body-tertiary">
              ${
                false ? `
                  <div class="form-floating mb-3">
                    <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
                    <label for="floatingInput">Email address</label>
                  </div>
                  <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
                    <label for="floatingPassword">Password</label>
                  </div>
                  <div class="checkbox mb-3">
                    <label>
                      <input type="checkbox" value="remember-me"> Remember me
                    </label>
                  </div>
                ` : ''
              }
                <button class="w-100 btn btn-lg btn-primary" onClick="LoginController.submit()">Sign in with 42</button>
                <hr class="my-4">
                <small class="text-body-secondary">By clicking Sign in with 42, you will be redirected to 42's authorization service.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}