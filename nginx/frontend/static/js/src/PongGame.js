import * as THREE from 'three'

import fontJSON from '/static/fonts/Bit5x3_Regular.js'

import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'


export default class PongGame {
  constructor({
    containerID = '',
    multiplayer = false,
    leftUsername =  '',
    rightUsername = '',
    controlSide = '',
    gameWebSocket = undefined,
    width = 720,
    depth = 405
  }) {
    this.depth = depth
    this.width = width
    this.containerID = containerID
    this.multiplayer = multiplayer
    this.leftUsername = leftUsername
    this.rightUsername = rightUsername
    this.controlSide = controlSide
    this.gameWebSocket = gameWebSocket
    this.font = new FontLoader().parse(fontJSON)

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
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.depth, 0.1, 1000)
    this.camera.position.z = 10

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    this.renderer.setSize(this.width, this.depth)

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
    this.scoreBoard = {}
    this.setLeftUsername()
    this.updateLeftScore()
    this.setRightUsername()
    this.updateRightScore()

    this.ballxStep = 0.05
    this.ballyStep = 0.05

    this.ballStartDirection = 0
    // this.controlSide == 'right' ? 1.5 : -1.5

    this.paddleyStep = 0.1

    this.paddleUp = 1
    this.paddleDown = -1
    this.paddleStatic = 0

    this.updateRate = 10

    this.dx
    this.dy
  }

  setGameWebSocket(gameWebSocket) {
    this.gameWebSocket = gameWebSocket
  }

  setPaddleMovingDirection(paddleType, direction) {
    if (![this.paddleUp, this.paddleDown, this.paddleStatic].includes(direction))
      return

    if (paddleType == 'left')
      this.leftPaddle.userData['movingDirection'] = direction
    else if (paddleType == 'right')
      this.rightPaddle.userData['movingDirection'] = direction
  }

  smoothMovePaddleYPosition(paddleType, position) {
    const step = 20
    const end = position

    if (paddleType == 'left') {
      const start = this.leftPaddle.position.y
      const diff = end - start

      for (let i = 0; i < step; i++) {
        this.leftPaddle.position.y = start + i * ((diff) / (step - 1))
      }
    }
    else if (paddleType == 'right') {
      const start = this.leftPaddle.position.y
      const diff = end - start

      for (let i = 0; i < step; i++) {
        this.rightPaddle.position.y = start + i * ((diff) / (step - 1))
      }
    }
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

  setLeftUsername() {
    this.scene.remove(this.scoreBoard['leftUsername'])

    const leftUsernameGeometry = new TextGeometry(
      String(this.leftUsername),
      {font: this.font, size: 0.75, depth: 0.25}
    )

    const leftUsernameNameBoard = new THREE.Mesh(
      leftUsernameGeometry,
      [
        new THREE.MeshPhongMaterial({color: 0xad4000}),
        new THREE.MeshPhongMaterial({color: 0x5c2301})
      ]
    )

    const usenameSize = new THREE.Vector3()
    new THREE.Box3().setFromObject(leftUsernameNameBoard).getSize(usenameSize)

    leftUsernameNameBoard.castShadow = true
    leftUsernameNameBoard.position.x = -2 - usenameSize.x
    leftUsernameNameBoard.position.y = this.gameTopBound - 3.5
    leftUsernameNameBoard.position.z = -1

    this.scene.add(leftUsernameNameBoard)
    this.scoreBoard['leftUsername'] = leftUsernameNameBoard
  }

  setRightUsername() {
    this.scene.remove(this.scoreBoard['righttUsername'])

    const rightUsernameGeometry = new TextGeometry(
      String(this.rightUsername),
      {font: this.font, size: 0.75, depth: 0.25}
    )

    const rightUsernameNameBoard = new THREE.Mesh(
      rightUsernameGeometry,
      [
        new THREE.MeshPhongMaterial({color: 0xad4000}),
        new THREE.MeshPhongMaterial({color: 0x5c2301})
      ]
    )

    rightUsernameNameBoard.castShadow = true
    rightUsernameNameBoard.position.x = 2
    rightUsernameNameBoard.position.y = this.gameTopBound - 3.5
    rightUsernameNameBoard.position.z = -1

    this.scene.add(rightUsernameNameBoard)
    this.scoreBoard['righttUsername'] = rightUsernameNameBoard
  }

  updateRightScore() {
    this.scene.remove(this.scoreBoard['rightPlayerScoreBoard'])

    const rightScoreGeometry = new TextGeometry(
      String(this.rightPlayerScore),
      {font: this.font, size: 2, depth: 0.25}
    )

    const rightPlayerScoreBoard = new THREE.Mesh(
      rightScoreGeometry,
      [
        new THREE.MeshPhongMaterial({color: 0xad4000}),
        new THREE.MeshPhongMaterial({color: 0x5c2301})
      ]
    )
    rightPlayerScoreBoard.castShadow = true
    rightPlayerScoreBoard.position.x = 2
    rightPlayerScoreBoard.position.y = this.gameTopBound - 2
    rightPlayerScoreBoard.position.z = -1

    this.scene.add(rightPlayerScoreBoard)
    this.scoreBoard['rightPlayerScoreBoard'] = rightPlayerScoreBoard
  }

  updateLeftScore() {
    this.scene.remove(this.scoreBoard['leftPlayerScoreBoard'])

    const leftScoreGeometry = new TextGeometry(
      String(this.leftPlayerScore),
      {font: this.font, size: 2, depth: 0.25}
    )

    const leftPlayerScoreBoard = new THREE.Mesh(
      leftScoreGeometry,
      [
        new THREE.MeshPhongMaterial({color: 0xad4000}),
        new THREE.MeshPhongMaterial({color: 0x5c2301})
      ]
    )
    leftPlayerScoreBoard.castShadow = true
    leftPlayerScoreBoard.position.x = -2 - leftPlayerScoreBoard.scale.x
    leftPlayerScoreBoard.position.y = this.gameTopBound - 2
    leftPlayerScoreBoard.position.z = -1

    this.scene.add(leftPlayerScoreBoard)
    this.scoreBoard['leftPlayerScoreBoard'] = leftPlayerScoreBoard
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

  async setPaddleDirection(direction, key) {
    if (this.controlSide) {
      if (this.controlSide == 'left')
        this.leftPaddle.userData['movingDirection'] = direction
      else
        this.rightPaddle.userData['movingDirection'] = direction

      await this.sendGameState(direction)
    } else {
      if ([38, 40].includes(key))
        this.rightPaddle.userData['movingDirection'] = direction
      else
        this.leftPaddle.userData['movingDirection'] = direction
    }
  }

  setKeyboardEvents() {
    const KEY_W = 87
    const KEY_S = 83
    const KEY_UP_ARROW = 38
    const KEY_DOWN_ARROW = 40

    window.onkeydown = e => {
      switch (e.keyCode) {
        case KEY_UP_ARROW:
          this.setPaddleDirection(this.paddleUp, KEY_UP_ARROW)
          break
        case KEY_DOWN_ARROW:
          this.setPaddleDirection(this.paddleDown, KEY_DOWN_ARROW)
          break
        case KEY_W:
          this.setPaddleDirection(this.paddleUp, KEY_W)
          break
        case KEY_S:
          this.setPaddleDirection(this.paddleDown, KEY_S)
          break
        default:
          break
      }
    }

    window.onkeyup = e => {
      switch (e.keyCode) {
        case KEY_UP_ARROW:
        case KEY_DOWN_ARROW:
          this.setPaddleDirection(this.paddleStatic, KEY_UP_ARROW)
          break
        case KEY_W:
        case KEY_S:
          this.setPaddleDirection(this.paddleStatic, KEY_W)
          break
      }
    }
  }

  async sendGameState(direction) {
    if (this.multiplayer && this.gameWebSocket && this.gameWebSocket.readyState === WebSocket.OPEN) {
      this.gameWebSocket.send(JSON.stringify({
        'paddle_type': this.controlSide,
        'paddle_moving_direction': direction,
        'padle_y_position': (this.controlSide == 'left' ? this.leftPaddle : this.rightPaddle).position.y,
        'ball_x_position': this.ball.position.x,
        'ball_y_position': this.ball.position.y,
        'left_player_score': this.leftPlayerScore,
        'right_player_score': this.rightPlayerScore,
      }))
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
      this.updateLeftScore()
    }

    if (this.ball.position.x < this.gameLeftBound) {
      this.setEntitiesDefualtParameters()
      this.rightPlayerScore += 1
      this.updateRightScore()
    }
  }

  createSphere(x, y, z, width, depth, length) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      new THREE.MeshBasicMaterial({color: this.ballColor})
    )

    sphere.position.set(x, y, z)
    sphere.scale.set(width, depth, length)

    this.scene.add(sphere)

    return sphere
  }

  createCube(x, y, z, width, depth, length) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1).toNonIndexed(),
      new THREE.MeshBasicMaterial({vertexColors: true})
    )

    cube.position.set(x, y, z)
    cube.scale.set(width, depth, length)

    this.scene.add(cube)

    return cube
  }

  createNet(x, y, z, width, depth, length) {
    for (let i = 0; i < (this.gameTopBound + 1.5); i += 1.5) {
      this.setCubeColors(
        this.createCube(x, y + i, z - 1, width, depth, length),
        this.cubeSideColors
      )
    }

    for (let i = 1.5; i < (Math.abs(this.gameBottomBound) + 1.5); i += 1.5) {
      this.setCubeColors(
        this.createCube(x, y - i, z - 1, width, depth, length),
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
