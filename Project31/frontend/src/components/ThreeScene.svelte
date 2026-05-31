<script>
  import { onMount, onDestroy } from 'svelte'
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { deviceStore } from '../stores/deviceStore'
  import { websocketStore } from '../stores/websocketStore'

  let container
  let scene, camera, renderer, controls
  let deviceMeshes = []
  let animationId
  let wsUnsubscribe

  const devicePositions = [
    { x: -8, y: 0, z: -4 }, { x: -4, y: 0, z: -4 },
    { x: 0, y: 0, z: -4 }, { x: 4, y: 0, z: -4 },
    { x: 8, y: 0, z: -4 }, { x: -8, y: 0, z: 2 },
    { x: -4, y: 0, z: 2 }, { x: 0, y: 0, z: 2 },
    { x: 4, y: 0, z: 2 }, { x: 8, y: 0, z: 2 }
  ]

  const initScene = () => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0d1117)
    scene.fog = new THREE.Fog(0x0d1117, 20, 60)

    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 5
    controls.maxDistance = 50
    controls.maxPolarAngle = Math.PI / 2

    addLights()
    addFloor()
    addGridHelper()
    createDevices()

    window.addEventListener('resize', onWindowResize)
  }

  const addLights = () => {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0x1890ff, 0.5, 30)
    pointLight1.position.set(-10, 5, -10)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x52c41a, 0.3, 30)
    pointLight2.position.set(10, 5, 10)
    scene.add(pointLight2)
  }

  const addFloor = () => {
    const floorGeometry = new THREE.PlaneGeometry(50, 50)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
  }

  const addGridHelper = () => {
    const gridHelper = new THREE.GridHelper(50, 50, 0x30363d, 0x21262d)
    gridHelper.position.y = 0.01
    scene.add(gridHelper)
  }

  const createDevices = () => {
    const devices = $deviceStore.devices
    devices.forEach((device, index) => {
      const position = devicePositions[index % devicePositions.length]
      const deviceGroup = createDeviceModel(device, index)
      deviceGroup.position.set(position.x, position.y, position.z)
      deviceGroup.userData = { deviceCode: device.deviceCode, deviceName: device.deviceName }
      scene.add(deviceGroup)
      deviceMeshes.push(deviceGroup)
    })
  }

  const createDeviceModel = (device, index) => {
    const group = new THREE.Group()

    const baseGeometry = new THREE.BoxGeometry(2, 0.5, 2)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.6,
      metalness: 0.4
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.25
    base.castShadow = true
    base.receiveShadow = true
    group.add(base)

    const bodyGeometry = new THREE.BoxGeometry(1.6, 2, 1.6)
    const bodyColor = getDeviceColor(device)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.3,
      metalness: 0.7,
      emissive: bodyColor,
      emissiveIntensity: 0.1
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 1.5
    body.castShadow = true
    group.add(body)

    const topGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.8, 16)
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.4,
      metalness: 0.6
    })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.y = 2.9
    top.castShadow = true
    group.add(top)

    const ringGeometry = new THREE.TorusGeometry(1, 0.05, 8, 32)
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      emissive: bodyColor,
      emissiveIntensity: 0.3
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.position.y = 1.5
    ring.rotation.x = Math.PI / 2
    group.add(ring)

    const panelGeometry = new THREE.PlaneGeometry(1, 0.6)
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1890ff,
      emissive: 0x1890ff,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide
    })
    const panel = new THREE.Mesh(panelGeometry, panelMaterial)
    panel.position.set(0, 1.5, 0.81)
    panel.userData.isPanel = true
    group.add(panel)

    if (device.alarmLevel === 'CRITICAL') {
      const alarmGeometry = new THREE.SphereGeometry(0.2, 16, 16)
      const alarmMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5222d,
        emissive: 0xf5222d,
        emissiveIntensity: 1
      })
      const alarm = new THREE.Mesh(alarmGeometry, alarmMaterial)
      alarm.position.set(0.8, 2.5, 0)
      alarm.userData.isAlarm = true
      group.add(alarm)
    }

    return group
  }

  const getDeviceColor = (device) => {
    if (device.alarmLevel === 'CRITICAL') return 0xf5222d
    if (device.alarmLevel === 'WARNING') return 0xfaad14
    if (device.status === 'ONLINE') return 0x52c41a
    return 0x6e7681
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    const time = Date.now() * 0.001

    deviceMeshes.forEach((group, index) => {
      group.children.forEach(child => {
        if (child.type === 'Mesh' && child.geometry.type === 'TorusGeometry') {
          child.rotation.z = time * 0.5 + index
        }
        if (child.userData.isAlarm) {
          child.scale.setScalar(1 + Math.sin(time * 5) * 0.2)
        }
      })

      const device = $deviceStore.devices.find(d => d.deviceCode === group.userData.deviceCode)
      if (device) {
        const color = new THREE.Color(getDeviceColor(device))
        group.children.forEach(child => {
          if (child.material && child.material.emissive) {
            child.material.color.lerp(color, 0.1)
            child.material.emissive.lerp(color, 0.1)
          }
        })
      }
    })

    controls.update()
    renderer.render(scene, camera)
  }

  const onWindowResize = () => {
    if (!container) return
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  onMount(() => {
    const checkStore = setInterval(() => {
      if ($deviceStore.devices.length > 0) {
        clearInterval(checkStore)
        initScene()
        animate()
      }
    }, 100)

    wsUnsubscribe = websocketStore.subscribe(state => {
      Object.values(state.statuses).forEach(status => {
        $deviceStore.updateDevice(status)
      })
    })

    onDestroy(() => {
      clearInterval(checkStore)
      if (animationId) cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onWindowResize)
      if (wsUnsubscribe) wsUnsubscribe()
      if (renderer) {
        renderer.dispose()
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement)
        }
      }
    })
  })
</script>

<div class="three-scene" bind:this={container}></div>

<style>
  .three-scene {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 480px;
    height: 360px;
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid var(--border-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .three-scene :global(canvas) {
    display: block;
  }
</style>
