/**
 * @license
 * ASME B31.3 Diesel Piping - Interactive 3D Visualization Tool
 * WebGL / Three.js Pipeline & Skid Layout Inspector
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HydraulicResults, PipeMaterial, TankArrangementId } from '../types';

interface ThreeDViewerProps {
  arrangementId: TankArrangementId;
  suctionNps: string;
  suctionMaterial: PipeMaterial;
  dischargeNps: string;
  dischargeMaterial: PipeMaterial;
  suctionElevM: number;
  dischargeElevM: number;
  results: HydraulicResults;
  isImperial?: boolean;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  arrangementId,
  suctionNps,
  suctionMaterial,
  dischargeNps,
  dischargeMaterial,
  suctionElevM,
  dischargeElevM,
  results,
  isImperial = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraView, setCameraView] = useState<'isometric' | 'top' | 'front' | 'pump'>('isometric');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // References to keep Three.js instances alive without tearing down canvas
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pipeGroupRef = useRef<THREE.Group | null>(null);
  const isMouseDownRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 26 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 3, 0));
  const autoRotateRef = useRef(false);

  autoRotateRef.current = isRotating;

  // Initialize Three.js scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1120'); // Dark CAD Workstation Blue
    scene.fog = new THREE.FogExp2('#0b1120', 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(20, 35, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.6); // Soft blue rim light
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // CAD Grid Floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Dynamic pipe group
    const pipeGroup = new THREE.Group();
    scene.add(pipeGroup);
    pipeGroupRef.current = pipeGroup;

    // Animation & render loop
    let animId: number;
    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      const target = cameraTargetRef.current;
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);
    };

    const renderScene = () => {
      animId = requestAnimationFrame(renderScene);

      if (autoRotateRef.current) {
        cameraAngleRef.current.theta += 0.005;
        updateCameraPos();
      }

      renderer.render(scene, camera);
    };

    updateCameraPos();
    renderScene();

    // Mouse Controls (Rotate & Zoom)
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const dx = e.clientX - mousePosRef.current.x;
      const dy = e.clientY - mousePosRef.current.y;
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      if (e.buttons === 1) {
        // Orbit
        cameraAngleRef.current.theta -= dx * 0.008;
        cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - dy * 0.008));
        updateCameraPos();
      } else if (e.buttons === 2) {
        // Pan
        const panSpeed = 0.03;
        const right = new THREE.Vector3();
        camera.getWorldDirection(new THREE.Vector3());
        camera.matrixWorld.extractBasis(right, new THREE.Vector3(), new THREE.Vector3());
        cameraTargetRef.current.addScaledVector(right, -dx * panSpeed);
        cameraTargetRef.current.y += dy * panSpeed;
        updateCameraPos();
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(8, Math.min(60, cameraAngleRef.current.radius + e.deltaY * 0.02));
      updateCameraPos();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Update 3D Geometry whenever arrangement, pipes, or elevations change
  useEffect(() => {
    const group = pipeGroupRef.current;
    if (!group) return;

    // Clear old 3D children
    while (group.children.length > 0) {
      const obj = group.children[0] as THREE.Mesh;
      group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }

    // Material helper
    const getMeshMaterial = (mat: PipeMaterial) => {
      const color = new THREE.Color(mat.colorHex);
      if (mat.id.includes('ss')) {
        return new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.85 });
      }
      if (mat.id.includes('copper')) {
        return new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.7 });
      }
      if (mat.id.includes('hdpe')) {
        return new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6, metalness: 0.1 });
      }
      // Carbon steel
      return new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.4 });
    };

    const suctionMat3d = getMeshMaterial(suctionMaterial);
    const dischargeMat3d = getMeshMaterial(dischargeMaterial);
    const pumpBaseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
    const pumpMotorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.6 }); // Electric blue
    const pumpVoluteMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4, metalness: 0.6 }); // Industrial red
    const valveHandwheelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.3 }); // Red valve
    const valveBodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 }); // Bronze/steel
    const tankSteelMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.5,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber diesel liquid
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
    });

    // NPS size scale
    const parseNpsRadius = (nps: string) => {
      const num = parseFloat(nps) || (nps.includes('/') ? 0.75 : 2);
      return Math.max(0.12, Math.min(0.6, 0.08 + num * 0.05));
    };

    const sRadius = parseNpsRadius(suctionNps);
    const dRadius = parseNpsRadius(dischargeNps);

    // Helpers to create pipe segment
    const addPipeCylinder = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      radius: number,
      mat: THREE.Material
    ) => {
      const distance = p1.distanceTo(p2);
      const geom = new THREE.CylinderGeometry(radius, radius, distance, 16);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;

      const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mesh.position.copy(midpoint);

      const orientation = new THREE.Vector3().subVectors(p2, p1).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, orientation);
      mesh.setRotationFromQuaternion(quaternion);

      group.add(mesh);
      return mesh;
    };

    // Helper for valve
    const addValve = (pos: THREE.Vector3, dir: 'x' | 'y' | 'z', radius: number) => {
      const valveGroup = new THREE.Group();
      valveGroup.position.copy(pos);

      // Body (Spherical or Box)
      const bodyGeom = new THREE.SphereGeometry(radius * 1.8, 12, 12);
      const bodyMesh = new THREE.Mesh(bodyGeom, valveBodyMat);
      valveGroup.add(bodyMesh);

      // Stem & Handwheel
      const stemGeom = new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, radius * 2.2, 8);
      const stemMesh = new THREE.Mesh(stemGeom, valveBodyMat);
      stemMesh.position.y = radius * 1.5;
      valveGroup.add(stemMesh);

      const wheelGeom = new THREE.TorusGeometry(radius * 1.4, radius * 0.25, 8, 16);
      const wheelMesh = new THREE.Mesh(wheelGeom, valveHandwheelMat);
      wheelMesh.position.y = radius * 2.6;
      wheelMesh.rotation.x = Math.PI / 2;
      valveGroup.add(wheelMesh);

      group.add(valveGroup);
    };

    // Helper for Flanges
    const addFlange = (pos: THREE.Vector3, radius: number) => {
      const geom = new THREE.CylinderGeometry(radius * 2.0, radius * 2.0, 0.15, 16);
      const mesh = new THREE.Mesh(geom, valveBodyMat);
      mesh.position.copy(pos);
      group.add(mesh);
    };

    // 1. PUMP SKID AT ORIGIN (x=0, y=0.5, z=0)
    // Baseplate
    const baseplateGeom = new THREE.BoxGeometry(4.5, 0.4, 2.5);
    const baseplate = new THREE.Mesh(baseplateGeom, pumpBaseMat);
    baseplate.position.set(0, 0.2, 0);
    group.add(baseplate);

    // Electric Motor (Cylinder)
    const motorGeom = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 20);
    const motor = new THREE.Mesh(motorGeom, pumpMotorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-1.0, 1.2, 0);
    group.add(motor);

    // Motor Terminal Box
    const tBoxGeom = new THREE.BoxGeometry(0.6, 0.5, 0.6);
    const tBox = new THREE.Mesh(tBoxGeom, pumpMotorMat);
    tBox.position.set(-1.0, 2.1, 0);
    group.add(tBox);

    // Coupling Guard
    const couplingGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.7, 16);
    const coupling = new THREE.Mesh(couplingGeom, pumpBaseMat);
    coupling.rotation.z = Math.PI / 2;
    coupling.position.set(0.4, 1.2, 0);
    group.add(coupling);

    // Pump Volute / Head
    const voluteGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.9, 20);
    const volute = new THREE.Mesh(voluteGeom, pumpVoluteMat);
    volute.rotation.z = Math.PI / 2;
    volute.position.set(1.2, 1.2, 0);
    group.add(volute);

    // Suction Nozzle (facing left/down)
    const pumpSuctionPoint = new THREE.Vector3(1.2, 1.2, 0.8);
    // Discharge Nozzle (facing vertical up)
    const pumpDischargePoint = new THREE.Vector3(1.2, 2.1, 0);

    // 2. SOURCE TANK & SUCTION PIPING ACCORDING TO ARRANGEMENT
    const isUst = arrangementId === 'ust_suction_lift';
    const isAst = arrangementId === 'ast_flooded_suction';
    const isDayTankGravity = arrangementId === 'day_tank_gravity';
    const isTanker = arrangementId === 'tanker_unloading';

    if (isUst) {
      // Underground Storage Tank (UST)
      const ustX = -8;
      const ustY = -2.5 - Math.max(1, suctionElevM);
      const ustZ = 0;

      // Tank Shell (Horizontal Cylinder)
      const ustGeom = new THREE.CylinderGeometry(2.5, 2.5, 7, 24);
      const ustMesh = new THREE.Mesh(ustGeom, tankSteelMat);
      ustMesh.rotation.z = Math.PI / 2;
      ustMesh.position.set(ustX, ustY, ustZ);
      group.add(ustMesh);

      // Diesel Liquid inside
      const dieselGeom = new THREE.CylinderGeometry(2.3, 2.3, 6.6, 20);
      const dieselMesh = new THREE.Mesh(dieselGeom, liquidMat);
      dieselMesh.rotation.z = Math.PI / 2;
      dieselMesh.position.set(ustX, ustY - 0.2, ustZ);
      group.add(dieselMesh);

      // Manway Riser
      const riserGeom = new THREE.CylinderGeometry(0.9, 0.9, Math.abs(ustY) + 0.5, 16);
      const riserMesh = new THREE.Mesh(riserGeom, pumpBaseMat);
      riserMesh.position.set(ustX + 1.5, ustY / 2 + 0.25, ustZ);
      group.add(riserMesh);

      // Suction Pipe Path: From inside UST -> Up above grade -> Over to pump
      const pFootValve = new THREE.Vector3(ustX + 1.5, ustY - 1.5, ustZ);
      const pGrade = new THREE.Vector3(ustX + 1.5, 1.2, ustZ);
      const pPumpApproach = new THREE.Vector3(1.2, 1.2, ustZ);

      // Foot valve
      const fvGeom = new THREE.CylinderGeometry(sRadius * 2, sRadius * 1.5, 0.6, 12);
      const fvMesh = new THREE.Mesh(fvGeom, valveBodyMat);
      fvMesh.position.copy(pFootValve);
      group.add(fvMesh);

      addPipeCylinder(pFootValve, pGrade, sRadius, suctionMat3d);
      addPipeCylinder(pGrade, pPumpApproach, sRadius, suctionMat3d);
      addPipeCylinder(pPumpApproach, pumpSuctionPoint, sRadius, suctionMat3d);

      addValve(new THREE.Vector3(pPumpApproach.x - 1.5, 1.2, ustZ), 'x', sRadius);
    } else if (isAst) {
      // Aboveground Storage Tank (AST Flooded Suction)
      const astX = -9;
      const astY = 4;
      const astZ = 0;

      // Vertical Tank
      const astGeom = new THREE.CylinderGeometry(3.5, 3.5, 7.5, 24);
      const astMesh = new THREE.Mesh(astGeom, tankSteelMat);
      astMesh.position.set(astX, astY, astZ);
      group.add(astMesh);

      // Liquid core
      const liqGeom = new THREE.CylinderGeometry(3.3, 3.3, 5.5, 20);
      const liqMesh = new THREE.Mesh(liqGeom, liquidMat);
      liqMesh.position.set(astX, astY - 1.0, astZ);
      group.add(liqMesh);

      // Suction Nozzle at bottom of AST
      const astNozzle = new THREE.Vector3(astX + 3.5, 1.2, astZ);
      const pPumpIn = new THREE.Vector3(1.2, 1.2, astZ);

      addPipeCylinder(astNozzle, pPumpIn, sRadius, suctionMat3d);
      addPipeCylinder(pPumpIn, pumpSuctionPoint, sRadius, suctionMat3d);

      addValve(new THREE.Vector3(astX + 4.5, 1.2, astZ), 'x', sRadius);
      addFlange(astNozzle, sRadius);
    } else if (isTanker) {
      // Road Tanker Truck Offloading
      const truckX = -8;
      // Tanker trailer body
      const tankGeom = new THREE.CylinderGeometry(1.8, 1.8, 7.5, 20);
      const tankMesh = new THREE.Mesh(tankGeom, tankSteelMat);
      tankMesh.rotation.z = Math.PI / 2;
      tankMesh.position.set(truckX, 2.5, 0);
      group.add(tankMesh);

      // Offloading hose
      const hoseStart = new THREE.Vector3(truckX + 2, 1.0, 0);
      addPipeCylinder(hoseStart, pumpSuctionPoint, sRadius, suctionMat3d);
      addValve(new THREE.Vector3(truckX + 3.0, 1.0, 0), 'x', sRadius);
    } else {
      // Day Tank / Generic Feed
      const tankX = -7;
      const tankY = 3.5;
      const tankGeom = new THREE.BoxGeometry(3.0, 3.5, 3.0);
      const tankMesh = new THREE.Mesh(tankGeom, tankSteelMat);
      tankMesh.position.set(tankX, tankY, 0);
      group.add(tankMesh);

      const suctionStart = new THREE.Vector3(tankX + 1.5, 2.0, 0);
      const suctionMid = new THREE.Vector3(tankX + 1.5, 1.2, 0);
      addPipeCylinder(suctionStart, suctionMid, sRadius, suctionMat3d);
      addPipeCylinder(suctionMid, pumpSuctionPoint, sRadius, suctionMat3d);
      addValve(new THREE.Vector3(tankX + 3.0, 1.2, 0), 'x', sRadius);
    }

    // 3. DISCHARGE PIPING & DESTINATION TANK / GENERATOR
    const destX = 8;
    const destY = 2 + Math.max(1, dischargeElevM * 0.8);
    const destZ = 0;

    // Destination Day Tank / Emergency Generator Skid
    const dayTankGeom = new THREE.CylinderGeometry(2.0, 2.0, 3.5, 20);
    const dayTank = new THREE.Mesh(dayTankGeom, tankSteelMat);
    dayTank.position.set(destX, destY, destZ);
    group.add(dayTank);

    // Liquid in day tank
    const dtLiquidGeom = new THREE.CylinderGeometry(1.8, 1.8, 2.5, 16);
    const dtLiquid = new THREE.Mesh(dtLiquidGeom, liquidMat);
    dtLiquid.position.set(destX, destY - 0.5, destZ);
    group.add(dtLiquid);

    // Stand / Legs
    const legGeom = new THREE.CylinderGeometry(0.12, 0.12, destY - 1.75, 8);
    for (const [lx, lz] of [
      [destX - 1.2, destZ - 1.2],
      [destX + 1.2, destZ - 1.2],
      [destX - 1.2, destZ + 1.2],
      [destX + 1.2, destZ + 1.2],
    ]) {
      const leg = new THREE.Mesh(legGeom, pumpBaseMat);
      leg.position.set(lx, (destY - 1.75) / 2, lz);
      group.add(leg);
    }

    // Discharge Pipe Route: Pump Discharge (1.2, 2.1, 0) -> Up to overhead rack -> Across -> Drop to day tank top
    const pD1 = pumpDischargePoint;
    const pD2 = new THREE.Vector3(1.2, destY + 2.5, 0);
    const pD3 = new THREE.Vector3(destX, destY + 2.5, 0);
    const pD4 = new THREE.Vector3(destX, destY + 1.75, 0); // Enters top of tank

    addPipeCylinder(pD1, pD2, dRadius, dischargeMat3d);
    addPipeCylinder(pD2, pD3, dRadius, dischargeMat3d);
    addPipeCylinder(pD3, pD4, dRadius, dischargeMat3d);

    // Check Valve & Discharge Isolation Valve
    addValve(new THREE.Vector3(1.2, 3.2, 0), 'y', dRadius); // Check valve
    addValve(new THREE.Vector3(4.5, destY + 2.5, 0), 'x', dRadius); // Isolation valve

    // Flow Meter Body
    const meterGeom = new THREE.CylinderGeometry(dRadius * 2.2, dRadius * 2.2, 0.8, 16);
    const meter = new THREE.Mesh(meterGeom, pumpMotorMat);
    meter.rotation.z = Math.PI / 2;
    meter.position.set(3.0, destY + 2.5, 0);
    group.add(meter);
  }, [arrangementId, suctionNps, suctionMaterial, dischargeNps, dischargeMaterial, suctionElevM, dischargeElevM]);

  // Handle Preset Camera Views
  const setView = (view: 'isometric' | 'top' | 'front' | 'pump') => {
    setCameraView(view);
    if (!cameraRef.current) return;

    if (view === 'isometric') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 26 };
      cameraTargetRef.current.set(0, 3, 0);
    } else if (view === 'top') {
      cameraAngleRef.current = { theta: 0.001, phi: 0.01, radius: 28 };
      cameraTargetRef.current.set(0, 0, 0);
    } else if (view === 'front') {
      cameraAngleRef.current = { theta: 0.001, phi: Math.PI / 2, radius: 28 };
      cameraTargetRef.current.set(0, 3, 0);
    } else if (view === 'pump') {
      cameraAngleRef.current = { theta: Math.PI / 3, phi: Math.PI / 3.5, radius: 10 };
      cameraTargetRef.current.set(0.5, 1.5, 0);
    }

    const { theta, phi, radius } = cameraAngleRef.current;
    const target = cameraTargetRef.current;
    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-xl select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Toolbar */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700/80 text-xs shadow-lg">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          3D Isometric Model
        </span>

        <div className="h-3 w-px bg-slate-700 mx-1"></div>

        {/* View Presets */}
        <div className="flex rounded bg-slate-800 p-0.5 border border-slate-700">
          <button
            onClick={() => setView('isometric')}
            className={`px-2 py-0.5 rounded transition ${
              cameraView === 'isometric' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            ISO
          </button>
          <button
            onClick={() => setView('top')}
            className={`px-2 py-0.5 rounded transition ${
              cameraView === 'top' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            Top (Plan)
          </button>
          <button
            onClick={() => setView('front')}
            className={`px-2 py-0.5 rounded transition ${
              cameraView === 'front' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            Elevation
          </button>
          <button
            onClick={() => setView('pump')}
            className={`px-2 py-0.5 rounded transition ${
              cameraView === 'pump' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            Skid Zoom
          </button>
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
            isRotating
              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Toggle Turntable Auto-Rotation"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Turntable
        </button>

        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`px-2 py-0.5 rounded border transition ${
            showAnnotations
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {showAnnotations ? 'Labels ON' : 'Labels OFF'}
        </button>
      </div>

      {/* Interactive Overlaid Component Annotation Badges */}
      {showAnnotations && (
        <>
          {/* Suction Callout */}
          <div className="absolute left-6 bottom-16 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-md border border-slate-700 text-xs text-slate-200 shadow-xl max-w-[210px]">
            <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
              SUCTION HEADER
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Size:</span>
                <span className="font-mono font-medium">NPS {suctionNps}" (DN {results.suctionIdMm} mm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Material:</span>
                <span className="truncate max-w-[110px] text-right" title={suctionMaterial.name}>
                  {suctionMaterial.name.split(' ')[0]} {suctionMaterial.name.split(' ')[1]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Velocity:</span>
                <span
                  className={`font-mono font-bold ${
                    results.suctionVelocityMps <= 1.2 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isImperial
                    ? `${(results.suctionVelocityMps * 3.28084).toFixed(2)} ft/s`
                    : `${results.suctionVelocityMps} m/s`}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-0.5 mt-0.5">
                <span>Loss:</span>
                <span className="font-mono">
                  {isImperial
                    ? `${(results.suctionTotalHeadLossM * 3.28084).toFixed(2)} ft`
                    : `${results.suctionTotalHeadLossM} m`}
                </span>
              </div>
            </div>
          </div>

          {/* Pump Skid Callout */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-5 bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-md border border-slate-700 text-xs shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="font-semibold text-slate-100">Pump Operating Head</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-400">
                TDH: {isImperial ? `${results.totalDynamicHeadPsi} psi` : `${results.totalDynamicHeadM} m`}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  results.npshStatus === 'PASS'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                    : 'bg-amber-950 text-amber-400 border border-amber-700/50'
                }`}
              >
                NPSH Margin: +{results.npshMarginM}m
              </span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-purple-300">
                Motor: {results.recommendedMotorKw} kW ({results.recommendedMotorHp} HP)
              </span>
            </div>
          </div>

          {/* Discharge Callout */}
          <div className="absolute right-6 top-16 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-md border border-slate-700 text-xs text-slate-200 shadow-xl max-w-[210px]">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              DISCHARGE PIPELINE
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Size:</span>
                <span className="font-mono font-medium">NPS {dischargeNps}" (ID {results.dischargeIdMm} mm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Material:</span>
                <span className="truncate max-w-[110px] text-right" title={dischargeMaterial.name}>
                  {dischargeMaterial.name.split(' ')[0]} {dischargeMaterial.name.split(' ')[1]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Velocity:</span>
                <span
                  className={`font-mono font-bold ${
                    results.dischargeVelocityMps <= 2.2
                      ? 'text-emerald-400'
                      : results.dischargeVelocityMps <= 2.5
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {isImperial
                    ? `${(results.dischargeVelocityMps * 3.28084).toFixed(2)} ft/s`
                    : `${results.dischargeVelocityMps} m/s`}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-0.5 mt-0.5">
                <span>Loss:</span>
                <span className="font-mono">
                  {isImperial
                    ? `${(results.dischargeTotalHeadLossM * 3.28084).toFixed(2)} ft`
                    : `${results.dischargeTotalHeadLossM} m`}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation Hint at Bottom Right */}
      <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono bg-slate-900/60 px-2 py-0.5 rounded">
        Left-drag: Orbit | Right-drag: Pan | Wheel: Zoom
      </div>
    </div>
  );
};
