import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";


const monkeyUrl = new URL("/scene.gltf", import.meta.url);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#canvas"),
});

const canvasCont = document.querySelector("#container3D");
renderer.setSize(canvasCont.offsetWidth, canvasCont.offsetHeight);

const scene = new THREE.Scene();

const light1 = new THREE.PointLight(0xff0000, 1000);
light1.position.set(2.5, 2.5, 2.5);
scene.add(light1);

const camera = new THREE.PerspectiveCamera(
  45,
  canvasCont.offsetWidth / canvasCont.offsetHeight,
  0.1,
  1000
);

renderer.setClearColor(0x111010);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;

camera.position.set(20, 0, 30);
orbit.update();

// Set limited rotation angles
const minPolarAngle = Math.PI / 2; // Minimum angle in radians (45 degrees)
const maxPolarAngle = (3 * Math.PI) / 5; // Maximum angle in radians (135 degrees)
const minAzimuthAngle = -Math.PI / 4; // Minimum azimuth angle in radians (-45 degrees)
const maxAzimuthAngle = Math.PI / 4; // Maximum azimuth angle in radians (45 degrees)

orbit.minPolarAngle = minPolarAngle;
orbit.maxPolarAngle = maxPolarAngle;
orbit.minAzimuthAngle = minAzimuthAngle;
orbit.maxAzimuthAngle = maxAzimuthAngle;

const assetLoader = new GLTFLoader();

let mixer;
assetLoader.load(
  monkeyUrl.href,
  function (gltf) {
    const model = gltf.scene;

    model.traverse((node) => {
      if (node.isMesh && node.material) {
        // Load and assign texture with correct encoding
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(monkeyUrl.href, (loadedTexture) => {
          loadedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          loadedTexture.needsUpdate = true;
        });
        node.material.map = texture;

        // Ensure proper rendering of the texture
        node.material.needsUpdate = true;
      }
    });

    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Play a certain animation
    // const clip = THREE.AnimationClip.findByName(clips, 'HeadAction');
    // const action = mixer.clipAction(clip);
    // action.play();

    // Play all animations at the same time
    clips.forEach(function (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    });
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const clock = new THREE.Clock();
function animate() {
  if (mixer) mixer.update(clock.getDelta());
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = canvasCont.offsetWidth / canvasCont.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasCont.offsetWidth, canvasCont.offsetHeight);
});

////////////

const textureUrl = new URL("/final.glb", import.meta.url);
const renderer2 = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#canvas2"),
});

const canvasCont2 = document.querySelector("#container3D2");
renderer2.setSize(canvasCont2.offsetWidth, canvasCont2.offsetHeight);

const scene2 = new THREE.Scene();

const light2 = new THREE.DirectionalLight(0xffffff, 1000);
light2.position.set(100, 10, 10);
scene2.add(light2);

const camera2 = new THREE.PerspectiveCamera(
  75,
  canvasCont2.offsetWidth / canvasCont2.offsetHeight,
  0.1,
  1000
);
camera2.position.set(0, 150, 5);

renderer2.setClearColor(0x111010);

const controls2 = new OrbitControls(camera2, renderer2.domElement);
controls2.enableZoom = false;
controls2.update();

let model2;

const loader2 = new GLTFLoader();
loader2.load(
  textureUrl.href,
  function (gltf2) {
    model2 = gltf2.scene;

    model2.traverse((node2) => {
      if (node2.isMesh && node2.material) {
        node2.material.dispose(); // Dispose existing material
        const metallicMaterial = new THREE.MeshStandardMaterial({
          color: 0x0000ff,
          metalness: 1,
          roughness: 0,
        });
        node2.material = metallicMaterial;
      }
    }); 

    scene2.add(model2);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

function animate2() {
  requestAnimationFrame(animate2);

  controls2.update();

  renderer2.render(scene2, camera2);
  model2.rotation.z += 0.005;
}

animate2();

window.addEventListener("resize", function () {
  camera2.aspect = canvasCont2.offsetWidth / canvasCont2.offsetHeight;
  camera2.updateProjectionMatrix();
  renderer2.setSize(canvasCont2.offsetWidth, canvasCont2.offsetHeight);
});
