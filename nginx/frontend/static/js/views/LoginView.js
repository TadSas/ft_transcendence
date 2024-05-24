import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Login")

    if ('terminal' in params && params['terminal'] === 'true') {
      localStorage.setItem('showCode', 'true')
    }

    window.history.replaceState(null, null, window.location.pathname)
  }

  toggleContainer() {
    const loginCont = document.getElementById("login")

    if (loginCont.classList.contains("d-none"))
      loginCont.classList.remove("d-none")
  }

  twoFactorDialogBox() {
    const inputs = document.querySelectorAll(".otp-field > input")
    const button = document.querySelector(".otp-button")

    button.setAttribute("disabled", "")
    inputs[0].removeAttribute("disabled")
    inputs[0].focus()

    inputs[0].addEventListener("paste", function(event) {
      event.preventDefault()

      const pastedValue = (event.clipboardData || window.clipboardData).getData("text")
      const otpLength = inputs.length

      for (let i = 0; i < otpLength; i++) {
        if (i < pastedValue.length) {
          inputs[i].value = pastedValue[i]
          inputs[i].removeAttribute("disabled")
          inputs[i].focus
        } else {
          inputs[i].value = ""
          inputs[i].focus
        }
      }
    })

    inputs.forEach((input, index1) => {
      input.addEventListener("keyup", (e) => {
        const currentInput = input
        const nextInput = input.nextElementSibling
        const prevInput = input.previousElementSibling

        input.classList.remove('border-2')
        input.classList.remove('border-danger')

        if (currentInput.value.length > 1) {
          currentInput.value = ""
          return
        }

        if (
          nextInput &&
          nextInput.hasAttribute("disabled") &&
          currentInput.value !== ""
        ) {
          nextInput.removeAttribute("disabled")
          nextInput.focus()
        }

        if (e.key === "Backspace") {
          inputs.forEach((input, index2) => {
            if (index1 <= index2 && prevInput) {
              input.setAttribute("disabled", true)
              input.value = ""
              prevInput.focus()
            }
          })
        }

        button.classList.remove("active")
        button.setAttribute("disabled", "disabled")

        const inputsNo = inputs.length
        if (!inputs[inputsNo - 1].disabled && inputs[inputsNo - 1].value !== "") {
          button.classList.add("active")
          button.removeAttribute("disabled")

          return
        }
      })
    })
  }

  async getContent() {
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

          this.twoFactorDialogBox()
        }
      }
    })

    const totp_jwt = getCookie("totp_jwt")

    const oauth = `
      <div class="${totp_jwt ? 'd-none' : 'd-block'}">
        <i class="bi bi-asterisk h1 d-flex justify-content-center mb-4"></i>
        <button class="w-100 btn btn-lg btn-primary" onClick="LoginController.submit()">Sign in with 42</button>
        <hr class="my-4">
        <small class="text-body-secondary">By clicking Sign in with 42, you will be redirected to 42's authorization service.</small>
      </div>
    `
    const twofa = `
      <section class="container-fluid bg-body-tertiary ${totp_jwt ? 'd-block' : 'd-none'}">
        <div class="row justify-content-center">
            <div class="col-12 col-md-6 col-lg-4" style="min-width: 500px;">
              <div class="card-body text-center">
                <h4>Two Factor Authentication</h4>

                <p>
                  <small class="text-body-secondary">
                    Please enter your Google Authenticator OTP to <br> verify your account.
                  </small>
                </p>

                <div class="otp-field mb-4">
                  <input class="border rounded-3" type="number" placeholder="*" disabled />
                  <input class="border rounded-3" type="number" placeholder="*" disabled />
                  <input class="border rounded-3" type="number" placeholder="*" disabled />
                  <input class="border rounded-3" type="number" placeholder="*" disabled />
                  <input class="border rounded-3" type="number" placeholder="*" disabled />
                  <input class="border rounded-3" type="number" placeholder="*" disabled />
                </div>

                <button class="otp-button btn btn-primary" disabled onClick="LoginController.submitOTP()" >Verify</button>
                <a href="/" id="hiddenVerify" class="d-none" data-link></a>
              </div>
            </div>
          </div>
      </section>
    `

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
              ${twofa}
              ${oauth}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}