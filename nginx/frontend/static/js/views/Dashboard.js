import BaseView from "./BaseView.js"

import * as THREE from '/threejs/build/three.module.js';


export default class extends BaseView {
  constructor(params) {
    super(params)
    this.setTitle("Dashboard")
  }

  async getContent(routes, match) {

    // Experimental game engine
    
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.getElementById('game').appendChild(renderer.domElement)
    
    function addCube(x, y, w, h) {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set(x, y, 0)
      cube.scale.set(w, h, 1)
      scene.add(cube)

      return cube
    }
    
    // let paddle // player paddle
    // let wall // top wall
    let ball
    
    function init() {
      camera.position.z = 5
      ball = addCube(0, 0, 1, 1)
    }
    init()

    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // End of experimental game engine

    this.getBase(routes, match)

    return `
      <h1>Dashboard</h1>
      <p>You are viewing the dashboard!</p>
    `
  }
}