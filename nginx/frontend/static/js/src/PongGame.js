import * as THREE from 'three'

import fontJSON from '/static/fonts/Bit5x3_Regular.js'

import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'


export default class PongGame {
  constructor({
    containerID = '',
    multiplayer = false,
    leftSideName =  '',
    rightSideName = '',
    gameWebSocket = undefined,
  }) {
    this.initialized = false
    this.containerID = containerID
    this.multiplayer = multiplayer
    this.scoreBoard = {
      'left': {
        'score': 0,
        'scoreObj': undefined,
        'name': leftSideName,
        'nameObj': undefined
      },
      'right': {
        'score': 0,
        'scoreObj': undefined,
        'name': rightSideName,
        'nameObj': undefined
      }
    }
    this.gameWebSocket = gameWebSocket
    this.font = new FontLoader().parse(fontJSON)

    this.ballColor = 0xff0000
    this.cubeSideColors = [
      0xe0e0e0, // right
      0xe0e0e0, // left
      0xe0e0e0, // upper
      0xe0e0e0, // down
      0xbdbdbd, // front
      0xe0e0e0  // back
    ]

    this.pressedKeys = {'up': 0, 'down': 0}
    this.registerKeyboardEvents()
  }

  init(data) {
    this.drawGame(data)
    this.initialized = true

    this.animate()
    this.interval = setInterval(this.sendPaddleState.bind(this), 10)
  }

  drawGame(data) {
    const game = data.game
    const gameCanvas = game.canvas
    const gameBorders = game.borders
    const ball = data.ball
    const ballMeasurements = data.ball_measurements
    const paddles = data.paddles
    const paddleMeasurements = data.paddle_measurements
    const score = data.score

    this.createScene(gameCanvas.width, gameCanvas.height)
    this.setGameBorders(gameBorders.top, gameBorders.right, gameBorders.bottom, gameBorders.left)
    this.drawNet()
    this.drawBall(ball.x, ball.y, ballMeasurements.diameter)
    this.drawPaddles(paddles, paddleMeasurements)
    this.drawScoreBorad(score)
    this.insertCanvasIntoDOM()
  }

  createScene(width, height) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.z = 10

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    this.renderer.setSize(width, height)
  }

  setGameBorders(top, right, bottom, left) {
    this.gameTopBound = top
    this.gameRightBound = right
    this.gameBottomBound = bottom
    this.gameLeftBound = left
  }

  drawNet() {
    const x = 0
    const y = 0
    const z = 0
    const width = 0.5
    const depth = 1
    const length = 0

    for (let i = 0; i < (this.gameTopBound + 1.5); i += 1.5) {
      this.createCube(x, y + i, z - 1, width, depth, length, this.cubeSideColors)
    }

    for (let i = 1.5; i < (Math.abs(this.gameBottomBound) + 1.5); i += 1.5) {
      this.createCube(x, y - i, z - 1, width, depth, length, this.cubeSideColors)
    }
  }

  drawBall(x, y, diameter) {
    this.ball = this.createSphere(x, y, 0, diameter, this.ballColor)
  }

  createSphere(x, y, z, diameter, color) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      new THREE.MeshBasicMaterial({color: this.ballColor})
    )

    sphere.position.set(x, y, z)
    sphere.scale.set(diameter, diameter, diameter)
    sphere.material = new THREE.MeshBasicMaterial({color: color})

    this.scene.add(sphere)

    return sphere
  }

  createCube(x, y, z, width, depth, length, sideColors) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1).toNonIndexed(),
      new THREE.MeshBasicMaterial({vertexColors: true})
    )

    cube.position.set(x, y, z)
    cube.scale.set(width, depth, length)

    this.setCubeColors(cube, sideColors)

    this.scene.add(cube)

    return cube
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

  drawPaddles(paddles, paddleMeasurements) {
    const leftSide = {}
    const rightSide = {}
    const leftPaddles = paddles.left
    const rightPaddles = paddles.right
    const paddleWidth = paddleMeasurements.width
    const paddleHeight = paddleMeasurements.height

    for (let index in leftPaddles) {
      leftSide[index] = this.createCube(
        leftPaddles[index].x, leftPaddles[index].y, 0,
        paddleWidth, paddleHeight, 0.5, this.cubeSideColors
      )
    }

    for (let index in rightPaddles) {
      rightSide[index] = this.createCube(
        rightPaddles[index].x, rightPaddles[index].y, 0,
        paddleWidth, paddleHeight, 0.5, this.cubeSideColors
      )
    }

    this.paddles = {'left': leftSide, 'right': rightSide}
  }

  drawScoreBorad(score) {
    this.scoreBoard['left']['score'] = score['left']
    this.scoreBoard['right']['score'] = score['right']

    this.drawLeftSideScore()
    this.drawLeftSideName()
    this.drawRightSideScore()
    this.drawRightSideName()
  }

  drawLeftSideScore() {
    const leftScoreObj = this.scoreBoard['left']['scoreObj']
    leftScoreObj && this.scene.remove(leftScoreObj)

    const leftScoreGeometry = new TextGeometry(
      String(this.scoreBoard['left']['score']),
      {font: this.font, size: 2, depth: 0.25}
    )

    const leftPlayerScoreBoard = new THREE.Mesh(
      leftScoreGeometry,
      [
        new THREE.MeshPhongMaterial({color: 0xad4000}),
        new THREE.MeshPhongMaterial({color: 0x5c2301})
      ]
    )

    const usenameSize = new THREE.Vector3()
    new THREE.Box3().setFromObject(leftPlayerScoreBoard).getSize(usenameSize)

    leftPlayerScoreBoard.castShadow = true
    leftPlayerScoreBoard.position.x = -2 - usenameSize.x
    leftPlayerScoreBoard.position.y = this.gameTopBound - 2
    leftPlayerScoreBoard.position.z = -1

    this.scene.add(leftPlayerScoreBoard)
    this.scoreBoard['left']['scoreObj'] = leftPlayerScoreBoard
  }

  drawRightSideScore() {
    const rightScoreObj = this.scoreBoard['right']['scoreObj']
    rightScoreObj && this.scene.remove(rightScoreObj)

    const rightScoreGeometry = new TextGeometry(
      String(this.scoreBoard['right']['score']),
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
    this.scoreBoard['right']['scoreObj'] = rightPlayerScoreBoard
  }

  drawLeftSideName() {
    const leftNameObj = this.scoreBoard['left']['nameObj']
    leftNameObj && this.scene.remove(leftNameObj)

    const leftUsernameGeometry = new TextGeometry(
      String(this.scoreBoard['left']['name']),
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
    this.scoreBoard['left']['nameObj'] = leftUsernameNameBoard
  }

  drawRightSideName() {
    const rightNameObj = this.scoreBoard['right']['nameObj']
    rightNameObj && this.scene.remove(rightNameObj)

    const rightUsernameGeometry = new TextGeometry(
      String(this.scoreBoard['right']['name']),
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
    this.scoreBoard['right']['nameObj'] = rightUsernameNameBoard
  }

  insertCanvasIntoDOM() {
    const container = document.getElementById(this.containerID)

    container.innerHTML = ''
    container.appendChild(this.renderer.domElement)
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.renderer.render(this.scene, this.camera)
  }

  registerKeyboardEvents() {
    const KEY_W = 87
    const KEY_S = 83
    const KEY_UP_ARROW = 38
    const KEY_DOWN_ARROW = 40

    window.onkeydown = e => {
      switch (e.keyCode) {
        case KEY_UP_ARROW:
          this.pressedKeys['up'] = 1
          this.pressedKeys['down'] = 0
          break
        case KEY_DOWN_ARROW:
          this.pressedKeys['up'] = 0
          this.pressedKeys['down'] = 1
          break
        case KEY_W:
          this.pressedKeys['up'] = 1
          this.pressedKeys['down'] = 0
          break
        case KEY_S:
          this.pressedKeys['up'] = 0
          this.pressedKeys['down'] = 1
          break
        default:
          break
      }
    }

    window.onkeyup = e => {
      switch (e.keyCode) {
        case KEY_UP_ARROW:
        case KEY_W:
          this.pressedKeys['up'] = 0
          break
        case KEY_DOWN_ARROW:
        case KEY_S:
          this.pressedKeys['down'] = 0
          break
      }
    }
  }

  sendPaddleState() {
    if (this.gameWebSocket && this.gameWebSocket.readyState === WebSocket.OPEN)
      this.gameWebSocket.send(JSON.stringify({
        'type': 'move_paddle',
        'direction': this.pressedKeys['up'] - this.pressedKeys['down']
      }))
  }

  refresh(data) {
    if (!this.initialized)
      return

    this.refreshScore(data.score)
    this.refreshBall(data.ball)
    this.refreshPaddles(data.paddles)
  }

  refreshBall(ball) {
    this.ball.position.x = ball['x']
    this.ball.position.y = ball['y']
  }

  refreshPaddles(paddles) {
    if (!paddles)
      return

    const leftPaddles = this.paddles['left']
    for (let index in paddles.left) {
      const oldPadlle = leftPaddles[index].position
      const newPaddle = paddles['left'][index]

      oldPadlle.y = newPaddle['y']
      oldPadlle.x = newPaddle['x']
    }

    const rightPaddles = this.paddles['right']
    for (let index in paddles.right) {
      const oldPadlle = rightPaddles[index].position
      const newPaddle = paddles['right'][index]

      oldPadlle.y = newPaddle['y']
      oldPadlle.x = newPaddle['x']
    }
  }

  refreshScore(score) {
    if (score['left'] === this.scoreBoard['left']['score'] + 1) {
      this.scoreBoard['left']['score'] += 1
      this.drawLeftSideScore()
    }

    if (score['right'] === this.scoreBoard['right']['score'] + 1) {
      this.scoreBoard['right']['score'] += 1
      this.drawRightSideScore()
    }
  }
}
