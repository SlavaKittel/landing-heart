import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
gsap.registerPlugin(ScrollTrigger);

// Variables
const width = window.innerWidth;
const height = window.innerHeight;
let time = 0;
let lastTime = 0;
let newScrollLerp = 0;
const lerpFactor = 0.08;
let stopMouse = 0;
let timeoutMouse;
let instancedMeshHeart;
let heartSkeleton;
let start = 0;
// let targetStart = 1;

const newCameraPosition = new THREE.Vector3();
const loader = new GLTFLoader();
// const loader = new GLTFLoader(loadingManager);

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 10;

// Light and Ambient
// const ambientLight = new THREE.AmbientLight(0xffffff, 20);
// scene.add(ambientLight);
// const pointerLight = new THREE.PointLight(0xffffff, 10);
// pointerLight.position.set(3, 3, 3);
// scene.add(pointerLight);
// const lightHelper = new THREE.PointLightHelper(pointerLight, 1);
// scene.add(lightHelper);

// Marker for Debug
const vMarkerMouseDamp = new THREE.Vector3();
let marker = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 16, 8),
  new THREE.MeshBasicMaterial({ color: "red", wireframe: true })
);
// scene.add(marker);

// const loadingScreen = document.getElementById("loader");
// const progressBar = document.getElementById("progress-bar");
// const progressText = document.getElementById("progress-text");
// console.log(loadingScreen, progressBar, progressText);

// // Loading Manager
// const loadingManager = new THREE.LoadingManager();
// loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
// 	// console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
// };
// loadingManager.onLoad = function ( ) {
//   console.log( 'Loading complete!');
//   console.log(loadingScreen);
//   // loadingScreen.style.display = "none";
// };

const uniforms = {
  color: { value: new THREE.Color(0xff0000) },
  mousePos: { value: new THREE.Vector3() },
  // TODO create delta on Time
  uTime: { type: "f", value: 0 },
  uStopMouse: { value: null },
  uLightDirection: { value: new THREE.Vector3(0.1, 0.0, 0.0).normalize() },
  uAmbientLightColor: { value: new THREE.Color(0xff0000) },
  uMetalness: { value: 0.5 },
};
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
});

// Particle Geometry
const icosahedronGeometry = new THREE.IcosahedronGeometry(0.08, 0);
const instancedGeometry = new THREE.InstancedBufferGeometry().copy(
  icosahedronGeometry
);

// Raycaster
const raycaster = new THREE.Raycaster();
const pointerCoords = new THREE.Vector2();
function renderIntersects() {
  // update the picking ray with the camera and pointer position
  if (!heartSkeleton) return;
  raycaster.setFromCamera(pointerCoords, camera);
  const intersects = raycaster.intersectObjects([heartSkeleton.children[0]]);
  if (intersects.length > 0) {
    let { x, y, z } = intersects[0].point;
    marker.position.set(x, y, z);
  }
  renderer.render(scene, camera);
}


// TODO add stop mouse
function mouseStop() {
  // start = THREE.MathUtils.damp(1, 0, 10, deltaTime);
}

// Mouse Move
function onPointerMove(event) {
  pointerCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerCoords.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("pointermove", (e) => {
  start = 1;
  if (timeoutMouse) clearTimeout(timeoutMouse);
  timeoutMouse = setTimeout(mouseStop, 300);
  onPointerMove(e);
});


// Load GLB -Inside- Heart Geometry and -Instanced- Heart Mesh
loader.load(
  "./glb-models/real-heart-frame.glb",
  function (gltf) {
    heartSkeleton = gltf.scene;
    heartSkeleton.scale.set(0.336, 0.336, 0.336);
    heartSkeleton.rotateX(-Math.PI / 2);
    heartSkeleton.children[0].material.transparent = true;
    heartSkeleton.children[0].material.opacity = 0.5;
    heartSkeleton.children[0].material.color = new THREE.Color(0x000000);
    scene.add(heartSkeleton);
    // TODO add loading screen
    // loadingScreen.style.display = "none"; // Hide loading screen when done

    // Position and scale of -Inside- Heart Geometry
    const heartGeometry = heartSkeleton.children[0].geometry;
    heartGeometry.scale(3, 3, 3);
    heartGeometry.rotateX(Math.PI / 2);

    // Merge vertices for -Instanced- Heart Geometry
    const mergedHeartGeometry =
      BufferGeometryUtils.mergeVertices(heartGeometry);

    // Create -Instanced- mesh
    const meshPoints = new THREE.Points(mergedHeartGeometry, shaderMaterial);
    const positionAttribute = meshPoints.geometry.attributes.position;
    const instancedCount = positionAttribute.count;
    
    // -Instanced- Mesh Heart
    instancedMeshHeart = new THREE.InstancedMesh(
      instancedGeometry,
      shaderMaterial,
      instancedCount
    );
    const instancePositions = new Float32Array(instancedCount * 3);
    const instanceRotations = new Float32Array(instancedCount * 3);
    const instancedScale = new Float32Array(instancedCount);
    for (let i = 0; i < instancedCount; i++) {
      // Position
      instancePositions[i * 3 + 0] = positionAttribute.array[i * 3 + 0];
      instancePositions[i * 3 + 1] = positionAttribute.array[i * 3 + 1];
      instancePositions[i * 3 + 2] = positionAttribute.array[i * 3 + 2];
      instancePositions[i * 3 + 1] += (Math.random() - 0.5) * 0.08;
      // Random rotation
      instanceRotations[i * 3 + 0] = Math.random() * 0.2 * Math.PI * 2;
      instanceRotations[i * 3 + 1] = Math.random() * 0.1 * Math.PI * 2;
      instanceRotations[i * 3 + 2] = Math.random() * 0.1 * Math.PI * 2;

      instancedScale[i] = Math.random();
    }
    instancedMeshHeart.geometry.setAttribute(
      "instancePosition",
      new THREE.InstancedBufferAttribute(instancePositions, 3)
    );
    instancedMeshHeart.geometry.setAttribute(
      "instanceRotation",
      new THREE.InstancedBufferAttribute(instanceRotations, 3)
    );
    instancedMeshHeart.geometry.setAttribute(
      "instanceScale",
      new THREE.InstancedBufferAttribute(instancedScale, 1)
    );

    scene.add(instancedMeshHeart);
  }
  // function (xhr) {
  //   const progress = (xhr.loaded / xhr.total) * 100;
  //   progressBar.style.width = progress + "%";
  //   progressText.textContent = Math.round(progress) + "%";

  //   // Optional: Monitor progress
  //   console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  // },
  // function (error) {
  //   console.error("An error happened", error);
  // }
);


// Resize
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  renderer.setSize(w, h, false);
  camera.updateProjectionMatrix();
});

// Renderer in the DOM
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(width, height);
window.onload = () => {
  document.getElementById("heart-app")?.appendChild(renderer.domElement);
};

function animate() {
  requestAnimationFrame(animate);
  // Scroll
  const scroll = window.scrollY / window.innerHeight;

  // Linear interpolation
  time = performance.now() * 0.0006;
  const deltaTime = time - lastTime;
  lastTime = time;

  const markerMouse = marker.position.clone();
  for (const k in markerMouse) {
    if (k == "x" || k == "y" || k == "z")
      vMarkerMouseDamp[k] = THREE.MathUtils.damp(
        vMarkerMouseDamp[k],
        markerMouse[k],
        10,
        deltaTime
      );
  }

  // Uniforms
  uniforms.uTime.value += 0.01;
  uniforms.mousePos.value.copy(vMarkerMouseDamp);
  uniforms.uStopMouse.value = stopMouse;

  // Render intersects
  window.requestAnimationFrame(renderIntersects);

  // Camera
  newScrollLerp = THREE.MathUtils.lerp(newScrollLerp, scroll, lerpFactor);
  newCameraPosition.set(
    10 * Math.sin(newScrollLerp * Math.PI * 1.03),
    0,
    10 * Math.cos(newScrollLerp * Math.PI * 1.03)
  );
  camera.position.copy(newCameraPosition);
  if (instancedMeshHeart) camera.lookAt(instancedMeshHeart.position);

  // Render
  renderer.render(scene, camera);
}
// gsap.ticker.add(animate); -  same like animate()
animate();
