import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
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
// Materials
const stoneBackMaterial = new THREE.MeshPhysicalMaterial({
    map: null,
    flatShading: true,
    color: '#ffffff',
    metalness: 1,
    roughness: 0,
    opacity: 0.75,
    side: THREE.BackSide,
    transparent: true,
    envMapIntensity: 5,
    premultipliedAlpha: true
})

const stoneFrontMaterial = new THREE.MeshPhysicalMaterial({
    map: null,
    flatShading: true,
    color: '#202020',
    metalness: 0,
    roughness: 0,
    opacity: 0.75,
    side: THREE.FrontSide,
    transparent: true,
    envMap: environmentMap,
    envMapIntensity: 10,
    premultipliedAlpha: true
})

// Geometries
const stoneGeometry = new THREE.OctahedronGeometry(1, 2)

// Stone
const stoneBack = new THREE.Mesh(
    stoneGeometry,
    stoneBackMaterial
)

const stoneFront = new THREE.Mesh(
    stoneGeometry,
    stoneFrontMaterial
)

const stone = new THREE.Group()
stone.add(stoneBack, stoneFront)

stone.scale.set(1, 1.5, 1)
stone.rotateY(Math.PI * 0.1)
stone.rotateZ(- Math.PI * 0.07)

scene.add(stone)

/**
 * Lensflares
 */
// Color
debugObject.lensflareColor = '#3074b7'

// Textures
const lensflareTexture = textureLoader.load('/textures/lensflares/lensflare.png')
const lensflareReflectTexture = textureLoader.load('/textures/lensflares/lensflareReflect.png')

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
    lensflare.addElement(new LensflareElement(
        lensflareReflectTexture,
        100,
        5,
        new THREE.Color(0.5, 0.5, 0.5)
    ))

    pointLightLensflare.add(lensflare)
}

addLensflare(0, 0.15, 1)

gui.addColor(debugObject, 'lensflareColor').onChange(() => {
    pointLightLensflare.color.set(debugObject.lensflareColor)
})

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
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 1, 8)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

// Cursor
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = - (event.clientY / sizes.height - 0.5)
})

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
    // controls.update()

    // Update camera
    camera.position.x = cursor.x
    camera.position.y = cursor.y
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // Render
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()