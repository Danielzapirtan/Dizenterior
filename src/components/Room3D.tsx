import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlacedFurniture, RoomDimensions } from '../types';
import { FURNITURE_LIBRARY } from '../constants';

interface Room3DProps {
  furniture: PlacedFurniture[];
  roomDimensions: RoomDimensions;
}

export const Room3D: React.FC<Room3DProps> = ({ furniture, roomDimensions }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const roomW = roomDimensions.width / 100;
    const roomH = roomDimensions.height / 100;
    camera.position.set(roomW * 1.5, roomW, roomH * 1.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(roomW / 2, 0, roomH / 2);
    controls.update();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(roomW, roomH);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(roomW / 2, 0, roomH / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    
    // Back wall
    const backWallGeo = new THREE.BoxGeometry(roomW, 2.5, 0.1);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(roomW / 2, 1.25, -0.05);
    scene.add(backWall);

    // Left wall
    const leftWallGeo = new THREE.BoxGeometry(0.1, 2.5, roomH);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-0.05, 1.25, roomH / 2);
    scene.add(leftWall);

    // Furniture
    furniture.forEach(item => {
      const template = FURNITURE_LIBRARY.find(t => t.id === item.templateId);
      if (!template) return;

      const w = template.width / 100;
      const h = template.height / 100;
      const d = 0.5;

      const geo = new THREE.BoxGeometry(w, d, h);
      const mat = new THREE.MeshStandardMaterial({ color: template.color });
      const mesh = new THREE.Mesh(geo, mat);

      const posX = (item.x / 2) / 100; // PIXELS_PER_CM is 2
      const posZ = (item.y / 2) / 100;

      mesh.position.set(posX + w / 2, d / 2, posZ + h / 2);
      mesh.rotation.y = -item.rotation * (Math.PI / 180);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [furniture, roomDimensions]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#1a1a1a] relative overflow-hidden">
      <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg text-white text-[10px] uppercase tracking-widest pointer-events-none z-10">
        Mod Previzualizare 3D • Folosește mouse-ul pentru rotire
      </div>
    </div>
  );
};
