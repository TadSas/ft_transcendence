import BaseView from "./BaseView.js"

import * as THREE from '/threejs/build/three.module.js'

class PongGame {
  constructor(containerID, width = 1280, height = 720) {
    this.width = width
    this.height = height
    this.containerID = containerID
    
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})

    this.ball
    this.wall
    this.paddle

    this.dx = 0.05
    this.dy = 0
    this.moving = 0

    this.initGame()
  }

  initGame() {
    this.renderer.setSize(this.width, this.height)
    document.getElementById(containerID).appendChild(this.renderer.domElement)
  }

  addCube = (x, y, w, h) => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({color: 0x0d6efd})
    )

    cube.position.set(x, y, 0)
    cube.scale.set(w, h, 0.5)

    this.scene.add(cube)

    return cube
  }
}


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Dashboard")
  }

  async getContent(routes, match) {
    // new PongGame('game')

    // Experimental game engine

    const width = 1280
    const height = 720
    
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(width, height)
    document.getElementById('game').appendChild(renderer.domElement)
    
    const addCube = (x, y, w, h) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({color: 0x0d6efd})
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set(x, y, 0)
      cube.scale.set(w, h, 0.5)
      scene.add(cube)

      return cube
    }
    
    let ball
    let wall
    let paddle

    let dx = 0.25
    let dy = 0
    let moving = 0
    
    const init = () => {
      scene.clear()
      dx = 0.25
      dy = 0
      moving = 0
      camera.position.z = 10
      ball = addCube(0, 0, 1, 1)
      ball.material = new THREE.MeshBasicMaterial({color: 0xdc3545})
      wall = addCube(-5, 0, 0.1, 3)
      paddle = addCube(5, 0, 0.1, 3)
    }
    init()

    const precisionSum = (x, y) => {
      return Math.round((x + y + Number.EPSILON) * 1000) / 1000
    }

    const animateBall = () => {
      ball.position.y = precisionSum(ball.position.y, dy)
      ball.position.x = precisionSum(ball.position.x, dx)
    }

    const checkCollisionWith = (element, paddle = false) => {
      if (Math.abs(ball.position.x - element.position.x) <= 1) {
        if (
          // left corner of wall is smaller rigth corner of ball and
          // (element.position.x - element.scale.x / 2) < (ball.position.x + ball.scale.x / 2) &&
          // left corner of ball is smaller than right corner of wall
          // (ball.position.x - ball.scale.x / 2) < (element.position.x + element.scale.x / 2)
          (Math.abs(ball.position.x + (ball.scale.x / 2)) == Math.abs(element.position.x)) ||
          (Math.abs(ball.position.x - (ball.scale.x / 2)) == Math.abs(element.position.x))
        ) {
          dx *= -1
          // if (paddle && moving != 0)
          dy += moving * 0.1
        }
      }
    }

    const checkOutOfBounds = () => {
      if (ball.position.y < -6 || ball.position.y > 6)
        init()

      if (ball.position.x < -6 || ball.position.x > 6)
        init()
    }

    const update = () => {
      animateBall()
      checkCollisionWith(paddle, true)
      checkCollisionWith(wall)
      checkOutOfBounds()
      setTimeout(update, 50)
    }
    update()

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    window.onkeydown = e => {
      switch(e.key) {
        case "ArrowUp":
          paddle.position.y += 0.5
          moving = -1
          break
        case "ArrowDown":
          paddle.position.y += -0.5
          moving = 1
          break
        case "w":
          wall.position.y += 0.5
          moving = -1
          break
        case "s":
          wall.position.y += -0.5
          moving = 1
          break
        default:
          break
      }
    }

    window.onkeyup = e => {
      moving = 0
    }

    // End of experimental game engine

    this.getBase(routes, match)

    return `
      <h1>Dashboard</h1>
      <p>You are viewing the dashboard!</p>
    `
  }
}