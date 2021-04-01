import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Helpers
// const axesHelper = new THREE.AxesHelper(2)
// scene.add(axesHelper)

/**
 * Loaders
 */
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/milkyway/px.jpg',
    '/textures/environmentMaps/milkyway/nx.jpg',
    '/textures/environmentMaps/milkyway/py.jpg',
    '/textures/environmentMaps/milkyway/ny.jpg',
    '/textures/environmentMaps/milkyway/pz.jpg',
    '/textures/environmentMaps/milkyway/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Meshes
 */
// Colors
debugObject.gemBackColor = '#ffffff'
debugObject.gemFrontColor = '#202020'

// Materials
const gemBackMaterial = new THREE.MeshPhysicalMaterial({
    map: null,
    flatShading: true,
    color: debugObject.gemBackColor,
    metalness: 1,
    roughness: 0,
    opacity: 0.75,
    side: THREE.BackSide,
    transparent: true,
    envMapIntensity: 5,
    premultipliedAlpha: true
})

const gemFrontMaterial = new THREE.MeshPhysicalMaterial({
    map: null,
    flatShading: true,
    color: debugObject.gemFrontColor,
    metalness: 0,
    roughness: 0,
    opacity: 0.75,
    side: THREE.FrontSide,
    transparent: true,
    envMap: environmentMap,
    envMapIntensity: 10,
    premultipliedAlpha: true
})

gui.addColor(debugObject, 'gemBackColor').onChange(() => {
    gemBackMaterial.color.set(debugObject.gemBackColor)
})
gui.addColor(debugObject, 'gemFrontColor').onChange(() => {
    gemFrontMaterial.color.set(debugObject.gemFrontColor)
})

// Geometries
const gemGeometry = new THREE.OctahedronGeometry(1, 2)

// Gem
const gemChild = new THREE.Mesh(
    gemGeometry,
    gemBackMaterial
)
gemChild.scale.set(1, 1.5, 1)

const gemSecond = new THREE.Mesh(
    gemGeometry,
    gemFrontMaterial
)
gemSecond.scale.set(1, 1.5, 1)

const gemParent = new THREE.Group()
gemParent.add(gemSecond)
gemParent.add(gemChild)

gemParent.rotateY(Math.PI * 0.1)
gemParent.rotateZ(- Math.PI * 0.07)

scene.add(gemParent)

/**
 * Lensflares
 */
// Colors
debugObject.lensflareColor = '#008800'

// Textures
const lensflareTexture = textureLoader.load('/textures/lensflares/lensflare.png')
const lensflareBackTexture = textureLoader.load('/textures/lensflares/lensflareReflect.png')

// Lights
const pointLightLensflare = new THREE.PointLight(debugObject.lensflareColor, 0.8)

// Lensflare
const addLensflare = (x, y, z) =>
{
    pointLightLensflare.position.set(x, y, z)
    scene.add(pointLightLensflare)

    const lensflare = new Lensflare()

    lensflare.addElement(new LensflareElement(
        lensflareTexture,
        800,
        0,
        pointLightLensflare.color
    ))
    // lensflare.addElement(new LensflareElement(
    //     lensflareBackTexture,
    //     1000,
    //     0,
    //     pointLightLensflare.color
    // ))

    pointLightLensflare.add(lensflare)
}

addLensflare(0, 0.15, 1)

gui.addColor(debugObject, 'lensflareColor').onChange(() => {
    pointLightLensflare.color.set(debugObject.lensflareColor)
})
gui.add(pointLightLensflare, 'intensity').min(0).max(5).step(0.001)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 1, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post processing
 */
let RenderTargetClass = null

if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
{
    RenderTargetClass = THREE.WebGLMultisampleRenderTarget
    console.log('Using WebGLMultisampleRenderTarget')
}
else
{
    RenderTargetClass = THREE.WebGLRenderTarget
    console.log('Using WebGLRenderTarget')
}

const renderTarget = new RenderTargetClass(
    800,
    600,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
)

// Effect composer
const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

// Render pass
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// Antialias pass
if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)

    console.log('Using SMAA')
}

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()