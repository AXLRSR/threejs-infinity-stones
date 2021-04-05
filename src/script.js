import './style.css'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js'
import gsap from 'gsap'

/**
 * Const
 */
const stones = [
    {
        color: "#3074b7",
        name: "Space Stone",
        alt: "Tesseract",
        description: "The Tesseract is named for its cube-like appearance and is capable of controlling space itself, providing the user instant access to any location throughout the universe if used correctly. The unique element that composes the Tesseract has also been used to create advanced weaponry by races like the Humans. This stone played an important role in humanity's development during the dawn of the superhero age, attracting the attention of forces such as Red Skull and Thanos, both of whom sought to use the Tesseract's power for their own sinister intents. It is later revealed that the cube is a containment unit built around the actual Infinity Stone so that it could be somewhat safely handled and controlled."
    },
    {
        color: "#c4a131",
        name: "Mind Stone",
        alt: "Scepter",
        description: "The Scepter was a weapon that utilized the Mind Stone housed inside a blue computer module. The stone within had already been in the possession of Thanos when he gave it to Loki to aid him in his invasion of Earth. It grants to the user powerful mental abilities, like the power to subjugate the minds of others, bending them to the will of the user, as well as project the user's consciousness to a higher plane of existence. When Loki failed in his campaign, the Scepter fell into the possession of S.H.I.E.L.D., eventually being passed on to HYDRA via sleeper agents. The Scepter was then used in various HYDRA experiments, notably inducing superhuman powers in Sokovian twins Wanda and Pietro Maximoff."
    },
    {
        color: "#b71c1c",
        name: "Reality Stone",
        alt: "Aether",
        description: "The Aether appears as a dark, red, viscous liquid. It acts as a symbiotic force, capable of being absorbed into the body of a living host, giving the user the ability to warp reality at will, granting that person immense strength, durability, powers, and subjective influence over the universe. It is later shown that the Aether is actually an Infinity Stone contained in a liquid form. The Aether is given to The Collector by Thor's companions, Sif and Volstagg and later seized by Thanos, who solidified it into the Reality Stone and inserted it into his Infinity Gauntlet."
    },
    {
        color: "#a359c6",
        name: "Power Stone",
        alt: "Orb",
        description: "The Power Stone is an incredible power source, it increases the user's physical abilities and allows it to manipulate energy, which, when used at full potential, has enough power to obliterate an entire planet when unleashed. This stone was sought by Thanos, who tasked Ronan the Accuser to acquire it from the dead planet of Morag, in exchange for destroying Xandar. However, Star-Lord acquired the stone first and was prepared to sell it to The Collector with Gamora until its destructive power was unleashed at Knowhere. Soon after, Ronan obtained it and harnessed its energy with the intent of destroying all life on Xandar and killing Thanos. Star-Lord and the Guardians of the Galaxy were able to take the stone from Ronan and collectively harness its power to destroy him."
    },
    {
        color: "#388e3c",
        name: "Time Stone",
        alt: "Eye of Agamotto",
        description: "The Eye of Agamotto is an ancient artifact, a pendant created by Agamotto, the first Sorcerer Supreme, presumably to contain and harness the power of the green Time Stone contained inside. After being stored for an unknown amount of time on a pedestal in Kamar-Taj, it was recently wielded by Doctor Stephen Strange, first to aid him in his learning of sorcery, then in his final fight against Kaecilius and Dormammu. When wielded by someone having the necessary knowledge and skills, it appeared to be able to control the flow of time."
    },
    {
        color: "#c96a32",
        name: "Soul Stone",
        alt: "Vormir",
        description: "The Soul Stone could prove to be the greatest threat out of all the Infinity Stones.[18] Gamora knew of the location of the Soul Stone from a map she found to its whereabouts (which she burnt) but kept this a secret from Thanos. Once captured and interrogated by her father, whom tortured Gamora's sister Nebula, he took her to its holding place on Vormir, where Red Skull, the Soul Stone's guardian, told them that it could only be accessed after a personal cost was paid - namely, the sacrifice of a loved one, to ensure that the owner understood its power. Thanos then tearfully sacrificed his daughter and later woke up with the Soul Stone in his hand, adding it to the Infinity Gauntlet."
    }
]

const circleRadius = 10

/**
 * Base
 */
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

// Stones
const stonesGroup = new THREE.Group()

for (let i = 0; i < stones.length; i++) {
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

    stone.position.x = Math.sin((Math.PI / 3) * i) * circleRadius
    stone.position.z = Math.cos((Math.PI / 3) * i) * circleRadius

    stone.rotateY(Math.PI * 0.1)
    stone.rotateZ(- Math.PI * 0.07)

    stonesGroup.add(stone)
}

scene.add(stonesGroup)

/**
 * Lensflares
 */
// Textures
const lensflareTexture = textureLoader.load('/textures/lensflares/lensflare.png')
const lensflareReflectTexture = textureLoader.load('/textures/lensflares/lensflareReflect.png')

// Lensflare
const lensflareGroup = new THREE.Group()

for (let i = 0; i < stones.length; i++) {
    const pointLightLensflare = new THREE.PointLight(stones[i].color, 0.8, 2)

    const x = Math.sin((Math.PI / 3) * i) * (circleRadius - 1)
    const y = 0.15
    const z = Math.cos((Math.PI / 3) * i) * (circleRadius - 1)

    pointLightLensflare.position.set(x, y, z)
    lensflareGroup.add(pointLightLensflare)

    const lensflare = new Lensflare()

    lensflare.addElement(new LensflareElement(
        lensflareTexture,
        1000,
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

scene.add(lensflareGroup)

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
scene.add(camera)

// Cursor
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) =>
{
    cursor.x = (event.clientX / sizes.width - 0.5) * 2
    cursor.y = - (event.clientY / sizes.height - 0.5) * 2
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
 * Controls
 */
const btnPrev = document.querySelector('.btn.btn-prev')
const btnNext = document.querySelector('.btn.btn-next')

let slidePosition = 0

const slideAnimation = () =>
{
    gsap.to([stonesGroup.rotation, lensflareGroup.rotation], {
        duration: 1,
        ease: "power3.inOut",
        y: slidePosition * Math.PI / 3
    })
}

btnPrev.addEventListener('click', () =>
{
    slidePosition--
    slideAnimation()
})

btnNext.addEventListener('click', () =>
{
    slidePosition++
    slideAnimation()
})

window.addEventListener('keydown', (e) =>
{
    if(e.key === 'ArrowLeft')
    {
        slidePosition--
        slideAnimation()
    }
    if(e.key === 'ArrowRight')
    {
        slidePosition++
        slideAnimation()
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update camera
    const target = new THREE.Vector3(cursor.x, cursor.y, camera.position.z)
    camera.lookAt(new THREE.Vector3(0, 0, circleRadius))
    camera.position.lerp(target, 0.05)

    // Render
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()