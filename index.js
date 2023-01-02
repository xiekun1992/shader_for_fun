const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.01, 10000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setClearColor(0xcccccc)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.AmbientLight(0xffffff)
scene.add(light)
scene.add(camera)

const clock = new THREE.Clock()

const health = {
  value: 1.0
}
const time = {
  value: 0.0
}
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 1),
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      health,
      time,
      tex: {
        value: new THREE.TextureLoader().load('./healthbar.png')
      }
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
    uniform sampler2D tex;
    uniform float time;

    vec3 lerp(vec3 y1, vec3 y2, float weight) {
      return y1 + (y2 - y1) * weight;
    }
    void clip(float value) {
      if (value <= 0.0) {
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
      float thColor = saturate(inverseLerp(0.2, 0.8, health));

      // vec3 hColor = lerp(red, green, thColor);
      // vec3 hColor = lerp(red, green, health);

      float len = 8.0;
      vec2 coords = vUv;
      coords.x *= len;
      vec2 pointOnLineSeg = vec2(clamp(coords.x, 0.5, len - 0.5), 0.5);
      float sdf = distance(coords, pointOnLineSeg) * 2.0 - 1.0;
      clip(-sdf);
      float borderSdf = sdf + 0.2;
      // float borderMask = step(0.0, -borderSdf);

      float pd = fwidth(borderSdf);
      
      float borderMask = 1.0 - saturate(borderSdf / pd);

      float h = health > vUv.x? 1.0: 0.0;

      // clip(h - 0.5);

      // vec3 outColor = lerp(black, hColor, h);
      // gl_FragColor = vec4(outColor, 1.0);
      // gl_FragColor = vec4(hColor * h, 1.0);



      vec4 hColor = texture2D(tex, vec2(health, vUv.y));
      if (health <= 0.2) {
        float c = sin(time * 3.0) * 0.2 + 1.0;
        hColor *= c;
      }

      gl_FragColor = vec4(hColor.xyz * borderMask * h, 1.0);
    }
    `
  })
)
scene.add(plane)


const p1 = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.ShaderMaterial({
    vertexShader: `
    out vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    in vec2 vUv;
    void main() {
      float len = length(vUv * 2.0 - 1.0) - 0.2;
      // len = step(0.0, len);
      gl_FragColor = vec4(vec3(len), 1.0);
    }
    `
  })
)
p1.position.y = 1.5
scene.add(p1)

const p2 = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.ShaderMaterial({
    vertexShader: `
    out vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    in vec2 vUv;
    void main() {
      float len = length(vUv.x) - 0.0;
      // len = step(0.0, len);
      gl_FragColor = vec4(vec3(len), 1.0);
    }
    `
  })
)
p2.position.set(-1.5, 1.5, 0)
scene.add(p2)

function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
  time.value += clock.getDelta()
}

window.onresize = e => {
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

render()