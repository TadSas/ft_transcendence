import * as THREE from 'three'

import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'


class PongGame {
  constructor(containerID, font, width = 1280, height = 720) {
    this.font = font
    this.width = width
    this.height = height
    this.containerID = containerID

    this.ballColor = 0x000000
    this.cubeSideColors = [
      0xe0e0e0, // right
      0xe0e0e0, // left
      0xe0e0e0, // upper
      0xe0e0e0, // down
      0xbdbdbd, // front
      0xe0e0e0  // back
    ]

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
    this.camera.position.z = 10

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    this.renderer.setSize(this.width, this.height)

    const container = document.getElementById(this.containerID)
    container.innerHTML = ''
    container.appendChild(this.renderer.domElement)

    this.ball = this.createSphere(0, 0, 0, 0.25, 0.25, 0.25)
    this.ball.material = new THREE.MeshBasicMaterial({color: this.ballColor})

    this.leftPaddle = this.createCube(-10, 0, 0, 0.25, 3, 0.5)
    this.setCubeColors(this.leftPaddle, this.cubeSideColors)
    this.rightPaddle = this.createCube(10, 0, 0, 0.25, 3, 0.5)
    this.setCubeColors(this.rightPaddle, this.cubeSideColors)

    this.gameTopBound = 7
    this.gameBottomBound = -7
    this.gameLeftBound = -12
    this.gameRightBound = 12

    this.net = this.createNet(0, 0, 0, 0.5, 1, 0)

    this.leftPlayerScore = this.rightPlayerScore = 0
    this.scoreBoard = this.setScoreBoard()

    this.ballxStep = 0.05
    this.ballyStep = 0.05

    this.ballStartDirection = 1.5

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

  setScoreBoard() {
    if (this.scoreBoard) {
      this.scene.remove(this.scoreBoard['leftPlayerBoard'])
      this.scene.remove(this.scoreBoard['rightPlayerBoard'])
    }

    const leftScoreGeometry = new TextGeometry(String(this.leftPlayerScore), {
      font: this.font,
      size: 2,
      height: 0.25,
    })
    const rightScoreGeometry = new TextGeometry(String(this.rightPlayerScore), {
      font: this.font,
      size: 2,
      height: 0.25,
    })
    const materials = [
      new THREE.MeshPhongMaterial({color: 0xad4000}),
      new THREE.MeshPhongMaterial({color: 0x5c2301})
    ]

    const leftPlayerBoard = new THREE.Mesh(leftScoreGeometry, materials)
    leftPlayerBoard.castShadow = true
    leftPlayerBoard.position.x = -4 - leftPlayerBoard.scale.x
    leftPlayerBoard.position.y = this.gameTopBound - 2
    leftPlayerBoard.position.z = -1
    
    const rightPlayerBoard = new THREE.Mesh(rightScoreGeometry, materials)
    rightPlayerBoard.castShadow = true
    rightPlayerBoard.position.x = 4
    rightPlayerBoard.position.y = this.gameTopBound - 2
    rightPlayerBoard.position.z = -1

    this.scene.add(leftPlayerBoard)
    this.scene.add(rightPlayerBoard)

    return {
      'leftPlayerBoard': leftPlayerBoard,
      'rightPlayerBoard': rightPlayerBoard
    }
  }

  update() {
    this.animateBall()
    this.movePaddles()
    this.checkCollisionWithRightPaddles()
    this.checkCollisionWithLeftPaddles()
    this.checkCollisionWithBounds()
    this.checkBallOutOfBounds()

    if ([this.leftPlayerScore, this.rightPlayerScore].includes(11))
      return

    setTimeout(this.update.bind(this), this.updateRate)
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.renderer.render(this.scene, this.camera)
  }

  setKeyboardEvents() {
    window.onkeydown = e => {
      switch(e.keyCode) {
        case 38: // ArrowUp
          this.rightPaddle.userData['movingDirection'] = this.paddleUp

          break
        case 40: // ArrowDown
          this.rightPaddle.userData['movingDirection'] = this.paddleDown

          break
        case 87: // w
          this.leftPaddle.userData['movingDirection'] = this.paddleUp

          break
        case 83: // s
          this.leftPaddle.userData['movingDirection'] = this.paddleDown

          break
        default:
          break
      }
    }

    window.onkeyup = e => {
      switch(e.keyCode) {
        case 38: // ArrowUp
        case 40: // ArrowDown
          this.rightPaddle.userData['movingDirection'] = this.paddleStatic

          break
        case 87: // w
        case 83: // s
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
    if (this.ifPaddleInsideGameBounds(this.rightPaddle))
      this.rightPaddle.position.y += this.paddleyStep * this.rightPaddle.userData['movingDirection']
    else if (this.ifPaddleOverGameBounds(this.rightPaddle))
      this.rightPaddle.position.y -= this.paddleyStep / 10
    else if (this.ifPaddleUnderGameBounds(this.rightPaddle))
      this.rightPaddle.position.y += this.paddleyStep / 10

    if (this.ifPaddleInsideGameBounds(this.leftPaddle))
      this.leftPaddle.position.y += this.paddleyStep * this.leftPaddle.userData['movingDirection']
    else if (this.ifPaddleOverGameBounds(this.leftPaddle))
      this.leftPaddle.position.y -= this.paddleyStep / 10
    else if (this.ifPaddleUnderGameBounds(this.leftPaddle))
      this.leftPaddle.position.y += this.paddleyStep / 10
  }

  ifPaddleInsideGameBounds(paddle) {
    return (
      ((paddle.position.y + (paddle.scale.y / 2)) <= this.gameTopBound) &&
      ((paddle.position.y - (paddle.scale.y / 2)) >= this.gameBottomBound)
    )
  }

  ifPaddleUnderGameBounds(paddle) {
    return ((paddle.position.y - (paddle.scale.y / 2)) < this.gameBottomBound)
  }

  ifPaddleOverGameBounds(paddle) {
    return ((paddle.position.y + (paddle.scale.y / 2)) > this.gameTopBound)
  }

  checkCollisionWithRightPaddles() {
    if (
      (Math.floor(((this.ball.position.x + this.ball.scale.x / 2) + Number.EPSILON) * 10) / 10) ===
      (Math.floor(((this.rightPaddle.position.x - this.rightPaddle.scale.x / 2) + Number.EPSILON) * 10) / 10)
    ) {
        if (
          (this.rightPaddle.position.y - this.rightPaddle.scale.y / 2) < (this.ball.position.y + this.ball.scale.y / 2) &&
          (this.rightPaddle.position.y + this.rightPaddle.scale.y / 2) > (this.ball.position.y - this.ball.scale.y / 2)
        ) {
          this.dx *= -1
          this.dy += this.rightPaddle.userData['movingDirection'] * this.ballxStep
        }
    }
  }

  checkCollisionWithLeftPaddles() {
    if (
      (Math.floor(((this.ball.position.x - this.ball.scale.x / 2) + Number.EPSILON) * 10) / 10) ===
      (Math.floor(((this.leftPaddle.position.x + this.leftPaddle.scale.x / 2) + Number.EPSILON) * 10) / 10)
    ) {
        if (
          (this.leftPaddle.position.y - this.leftPaddle.scale.y / 2) < (this.ball.position.y + this.ball.scale.y / 2) &&
          (this.leftPaddle.position.y + this.leftPaddle.scale.y / 2) > (this.ball.position.y - this.ball.scale.y / 2)
        ) {
          this.dx *= -1
          this.dy += this.leftPaddle.userData['movingDirection'] * this.ballxStep
        }
    }
  }

  checkCollisionWithBounds() {
    if ((this.ball.position.y >= this.gameTopBound) || (this.ball.position.y <= this.gameBottomBound))
      this.dy *= -1
  }

  checkBallOutOfBounds() {
    if (this.ball.position.x > this.gameRightBound) {
      this.setEntitiesDefualtParameters()
      this.leftPlayerScore += 1
    }

    if (this.ball.position.x < this.gameLeftBound) {
      this.setEntitiesDefualtParameters()
      this.rightPlayerScore += 1
    }

    this.scoreBoard = this.setScoreBoard()
  }

  createSphere(x, y, z, width, height, length) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      new THREE.MeshBasicMaterial({color: this.ballColor})
    )

    sphere.position.set(x, y, z)
    sphere.scale.set(width, height, length)

    this.scene.add(sphere)

    return sphere
  }

  createCube(x, y, z, width, height, length) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1).toNonIndexed(),
      new THREE.MeshBasicMaterial({vertexColors: true})
    )

    cube.position.set(x, y, z)
    cube.scale.set(width, height, length)

    this.scene.add(cube)

    return cube
  }

  createNet(x, y, z, width, height, length) {
    for (let i = 0; i < (this.gameTopBound + 1.5); i += 1.5) {
      this.setCubeColors(
        this.createCube(x, y + i, z - 1, width, height, length),
        this.cubeSideColors
      )
    }

    for (let i = 1.5; i < (Math.abs(this.gameBottomBound) + 1.5); i += 1.5) {
      this.setCubeColors(
        this.createCube(x, y - i, z - 1, width, height, length),
        this.cubeSideColors
      )
    }
  }

  setCubeColors(cube, sideColors) {
    const colors = []
    const color = new THREE.Color()
    const positionAttribute = cube.geometry.getAttribute('position')

    for (let i = 0; i < positionAttribute.count; i += 6) {
      color.setHex(sideColors[i/6])
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
      
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
    }

    cube.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  }

  precisionSum(x, y) {
    return Math.round((x + y + Number.EPSILON) * 100) / 100
  }
}


export const PongController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.initPong = () => {
    new FontLoader().load('static/fonts/Bit5x3_Regular.json', font => {
      new PongGame('content', font).start()
    })
  }

  return self
})()
