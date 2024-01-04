import BaseView from "./BaseView.js"

import * as THREE from '/threejs/build/three.module.js'


class PongGame {
  constructor(containerID, width = 1280, height = 720) {
    this.width = width
    this.height = height
    this.containerID = containerID

    this.ballColor = 0xdc3545
    this.paddleColor = 0x0d6efd

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
    this.camera.position.z = 10

    this.renderer = new THREE.WebGLRenderer() // {antialias: true, alpha: true}
    this.renderer.setSize(this.width, this.height)

    document.getElementById(this.containerID).appendChild(this.renderer.domElement)

    this.ball = this.addCube(0, 0, 0, 1, 1, 0.5)
    this.ball.material = new THREE.MeshBasicMaterial({color: this.ballColor})

    this.leftPaddle = this.addCube(-5, 0, 0, 0.1, 3, 0.5)
    this.rightPaddle = this.addCube(5, 0, 0, 0.1, 3, 0.5)

    this.gameTopBound = 6
    this.gameBottomBound = -6
    this.gameLeftBound = -6
    this.gameRightBound = 6

    this.ballxStep = 0.05
    this.ballyStep = 0.05

    this.ballStartDirection = -1

    this.paddleyStep = 0.1

    this.paddleUp = 1
    this.paddleDown = -1
    this.paddleStatic = 0

    this.updateRate = 10

    this.dx
    this.dy
  }

  start() {
    this.setEntitiesDefualtParameters()

    this.update()

    this.animate()

    this.setKeyboardEvents()
  }

  setEntitiesDefualtParameters() {
    this.dx = this.ballxStep * this.ballStartDirection
    this.dy = 0

    this.ball.position.x = 0
    this.ball.position.y = 0

    this.leftPaddle.position.y = 0
    this.rightPaddle.position.y = 0

    this.leftPaddle.userData['movingDirection'] = this.paddleStatic
    this.rightPaddle.userData['movingDirection'] = this.paddleStatic
  }

  update() {
    this.animateBall()
    this.movePaddles()
    this.checkCollisionWith(this.rightPaddle)
    this.checkCollisionWith(this.leftPaddle)
    this.checkOutOfBounds()
    setTimeout(this.update.bind(this), this.updateRate)
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.renderer.render(this.scene, this.camera)
  }

  setKeyboardEvents() {
    window.onkeydown = e => {
      switch(e.key) {
        case "ArrowUp":
          this.rightPaddle.userData['movingDirection'] = this.paddleUp

          break
        case "ArrowDown":
          this.rightPaddle.userData['movingDirection'] = this.paddleDown

          break
        case "w":
          this.leftPaddle.userData['movingDirection'] = this.paddleUp

          break
        case "s":
          this.leftPaddle.userData['movingDirection'] = this.paddleDown

          break
        default:
          break
      }
    }

    window.onkeyup = e => {
      switch(e.key) {
        case "ArrowUp":
        case "ArrowDown":
          this.rightPaddle.userData['movingDirection'] = this.paddleStatic

          break
        case "w":
        case "s":
          this.leftPaddle.userData['movingDirection'] = this.paddleStatic

          break
      }
    }
  }

  animateBall() {
    this.ball.position.y = this.precisionSum(this.ball.position.y, this.dy)
    this.ball.position.x = this.precisionSum(this.ball.position.x, this.dx)
  }

  movePaddles() {
    this.rightPaddle.position.y += this.paddleyStep * this.rightPaddle.userData['movingDirection']
    this.leftPaddle.position.y += this.paddleyStep * this.leftPaddle.userData['movingDirection']
  }

  checkCollisionWith(element) {
    // There is a big issue in collision detection
    if (Math.abs(this.ball.position.x - element.position.x) <= 1) {
      if (
        (element.position.y - element.scale.y / 2) < (this.ball.position.y + this.ball.scale.y / 2) &&
        (element.position.y + element.scale.y / 2) > (this.ball.position.y - this.ball.scale.y / 2)
      ) {
        this.dx *= -1

        if (this.ball.position.x < 0)
          this.dy += this.leftPaddle.userData['movingDirection'] * this.ballxStep
        else
          this.dy += this.rightPaddle.userData['movingDirection'] * this.ballxStep
      }
    }
  }

  checkOutOfBounds() {
    if (this.ball.position.y > this.gameTopBound || this.ball.position.y < this.gameBottomBound)
      this.setEntitiesDefualtParameters()

    if (this.ball.position.x > this.gameRightBound || this.ball.position.x < this.gameLeftBound)
      this.setEntitiesDefualtParameters()
  }

  addCube = (x, y, z, width, height, length) => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({color: this.paddleColor})
    )

    cube.position.set(x, y, z)
    cube.scale.set(width, height, length)

    this.scene.add(cube)

    return cube
  }

  precisionSum(x, y) {
    return Math.round((x + y + Number.EPSILON) * 100) / 100
  }
}

export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Dashboard")
  }

  async getContent(routes, match) {
    new PongGame('game').start()

    this.getBase(routes, match)

    return `
      <h1>Dashboard</h1>
      <p>You are viewing the dashboard!</p>
    `
  }
}