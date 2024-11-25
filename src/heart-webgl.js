import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { DotLottie } from "@lottiefiles/dotlottie-web";

// Variables
const width = window.innerWidth;
const height = window.innerHeight;

// Prevent scroll on refresh
window.onbeforeunload = function () {
  console.log("dotLottie");
  window.scrollTo(0, 0);
};

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

// Loading Manager
const loadingScreen = document.getElementById("loader");
const progressBar = document.getElementById("progress-bar");

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  progressBar.style.width = progress + "%";
};
loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  new DotLottie({
    autoplay: true,
    loop: true,
    canvas: document.querySelector("#dotlottie-canvas"),
    src: "/gif/heart-gif-red.json",
  });
};
loadingManager.onLoad = function () {
  setTimeout(() => {
    loadingScreen.style.bottom = "100vh";
    document.body.style.overflow = "visible";

    const script = document.createElement("script");
    script.src = "./gsap.js";
    script.type = "module";
    document.body.appendChild(script);
    script.onload;
  }, 2000);
};

const uniforms = {
  // rename on uColor and uMousePos
  color: { value: new THREE.Color(0xff0000) },
  mousePos: { value: new THREE.Vector3() },
  uMouseTransition: { value: 0 },
  // TODO create delta on Time
  uTime: { type: "f", value: 0 },
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

// Mobile Device
function getMobileDevice() {
  const userAgent = navigator.userAgent || window.opera;
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
}

// TODO add stop mouse
let isMouseOnModel = false;
let isMouseMoving = false;
let mouseOnModelTimer;
let mouseMovingTimer;

document.addEventListener("touchmove", () => {
  if (!isMouseMoving) isMouseMoving = true;
  clearTimeout(mouseMovingTimer);
  mouseMovingTimer = setTimeout(() => (isMouseMoving = false), 100);
});
document.addEventListener("pointermove", () => {
  if (!isMouseMoving) isMouseMoving = true;
  clearTimeout(mouseMovingTimer);
  mouseMovingTimer = setTimeout(() => (isMouseMoving = false), 100);
});

let mouseValue = 0;
let direction = 1;
let speed = 0.35;

function getUpdateMouseValue(state) {
  const progressDelta = direction * speed;
  const boost = 4;

  if (!state && mouseValue >= 0) {
    direction = -1;
    mouseValue += Number(progressDelta.toFixed(1));
  } else if (state && mouseValue <= 100) {
    direction = 1;
    mouseValue += Number((progressDelta * boost).toFixed(1));
  }
}

// Raycaster
let heartSkeleton;

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
    isMouseOnModel = true;
    clearTimeout(mouseOnModelTimer);
    mouseOnModelTimer = setTimeout(() => (isMouseOnModel = false), 100);
  }
  renderer.render(scene, camera);
}

// Pointer Move
function onPointerMove(event) {
  if (getMobileDevice()) {
    const touch = event.touches[0];
    pointerCoords.x = (touch.clientX / window.innerWidth) * 2 - 1;
    pointerCoords.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    return;
  }
  pointerCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerCoords.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("pointermove", (event) => {
  onPointerMove(event);
});
document.addEventListener("touchmove", (event) => {
  onPointerMove(event);
});

// Load GLB -Inside- Heart Geometry and -Instanced- Heart Mesh
const loader = new GLTFLoader(loadingManager);

let instancedMeshHeart;

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
  if (getMobileDevice()) return;
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
function getDeviceType() {
  return getMobileDevice() ? "mobile" : "desktop";
}
renderer.domElement.classList.add(getDeviceType());
window.onload = () => {
  document.getElementById("heart-app")?.appendChild(renderer.domElement);
};

let time = 0;
let lastTime = 0;
let newScrollLerp = 0;
const lerpFactor = 0.08;
const newCameraPosition = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  // Scroll
  const scroll = window.scrollY / window.innerHeight;

  // Linear interpolation
  time = performance.now() * 0.0006;
  const deltaTime = time - lastTime;
  lastTime = time;

  getUpdateMouseValue(isMouseMoving && isMouseOnModel);

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
  // deltaTime for 0.01 ??
  uniforms.uTime.value += 0.01;
  uniforms.mousePos.value.copy(vMarkerMouseDamp);
  uniforms.uMouseTransition.value = mouseValue;

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
