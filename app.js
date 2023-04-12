import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import fragment from './shaders/fragment.glsl.js';
import vertex from './shaders/vertex.glsl.js';

export default class Sketch {
  constructor() {
    this.scene = new THREE.Scene();
    this.container = document.getElementById('container');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.useLegacyLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(0, -1, -0.05);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

    this.addMesh();
    // this.setupResize();
    // this.resize();
    this.render();
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    // optional - cover with quad
    const distance = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * distance));

    // if (w/h > 1)
    // if (this.width / this.height > 1) {
    //   this.plane.scale.x = this.camera.aspect;
    // } else {
    //   this.plane.scale.y = 1 / this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();
  }

  addMesh() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      uniforms: {
        uTime: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        bg: { value: new THREE.TextureLoader().load() },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
      // wireframe: true,
    });
    this.geometry = new THREE.BufferGeometry();

    let amount = 500;
    const positionsArray = new Float32Array(amount * amount * 3);

    for (let i = 0; i < amount; i++) {
      for (let j = 0; j < amount; j++) {
        let u = Math.random() * Math.PI * 2;
        let v = Math.random() * Math.PI;

        // let x = (0.9 + 0.2 * v) * Math.cos(u) * Math.sin(v);
        // let y = 1.5 * Math.cos(v);
        // let z = (0.9 + 0.2 * v) * Math.sin(u) * Math.sin(v);

        // positionsArray.set(
        //   [x, y, z], // value
        //   3 * (amount * i + j) // index
        // );

        positionsArray.set(
          [(i / amount - 0.5) * 10, (j / amount - 0.5) * 10, 0], // value
          3 * (amount * i + j) // index
        );
      }
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionsArray, 3)
    );

    this.plane = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  render() {
    this.time += 0.05;
    this.material.uniforms.uTime.value = this.time;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
