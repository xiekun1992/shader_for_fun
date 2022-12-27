const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.01, 10000)
camera.position.z = 10

const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setClearColor(0xcccccc)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.AmbientLight(0xffffff)
scene.add(light)
scene.add(camera)

const health = {
  value: 1.0
}
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 1),
  new THREE.ShaderMaterial({
    uniforms: {
      health
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    varying vec2 vUv;
    uniform float health;

    vec3 lerp(vec3 y1, vec3 y2, float weight) {
      return y1 + (y2 - y1) * weight;
    }
    void clip(float value) {
      if (value < 0.0) {
        discard;
      }
    }
    float inverseLerp(float a, float b, float v) {
      return (v - a) / (b - a);
    }
    float saturate(float value) {
      return clamp(value, 0.0, 1.0);
    }

    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 green = vec3(0.0, 1.0, 0.0);
    vec3 black = vec3(0.0, 0.0, 0.0);
    void main() {
      float thColor = saturate(inverseLerp(0.2, 0.9, health));

      vec3 hColor = lerp(red, green, thColor);
      // vec3 hColor = lerp(red, green, health);
      float h = health > vUv.x? 1.0: 0.0;

      clip(h - 0.5);

      vec3 outColor = lerp(black, hColor, h);
      gl_FragColor = vec4(outColor, 1.0);
    }
    `
  })
)
scene.add(plane)


function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}

window.onresize = e => {
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

render()