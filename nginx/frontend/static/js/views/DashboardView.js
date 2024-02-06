import BaseView from "./BaseView.js"


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Dashboard")
  }

  async getContent(routes, match) {
    this.getBase(routes, match)

    const carousel = `
    <div id="myCarousel" class="carousel carousel-dark slide mb-6" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="0" class="active" aria-label="Slide 1" aria-current="true"></button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1" aria-label="Slide 2" class=""></button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="2" aria-label="Slide 3" class=""></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active">
          <div class="carousel-page"></div>
          <div class="container">
            <div class="carousel-caption text-start text-dark-emphasis">
              <h1>
                Compete and Conquer!
              </h1>
              <p class="opacity-75">
                Dive into the World of Online Ping Pong
              </p>
            </div>
          </div>
        </div>
        <div class="carousel-item">
          <div class="carousel-page"></div>
          <div class="container">
            <div class="carousel-caption text-dark-emphasis">
              <h1>
                Pong and Chat, All in One Place!
              </h1>
              <p>
                Enhance Your Pong Experience with Live Chat!
              </p>
            </div>
          </div>
        </div>
        <div class="carousel-item">
          <div class="carousel-page"></div>
          <div class="container">
            <div class="carousel-caption text-end text-dark-emphasis">
              <h1>
                Are You Ready to Dominate?
              </h1>
              <p>
                Experience the Thrills of Pong Tournaments
              </p>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    `

    return `
    ${carousel}
    <hr>
    `
  }
}