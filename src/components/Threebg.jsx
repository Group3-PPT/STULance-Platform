import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const ThreeBg = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);

        // 1. Quả cầu trung tâm
        const coreGeo = new THREE.IcosahedronGeometry(7, 1);
        const coreMat = new THREE.MeshBasicMaterial({ 
            color: 0x3b82f6, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.3 
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        scene.add(coreMesh);

        // 2. Nhóm chứa chữ (Text Group)
        // const textGroup = new THREE.Group();
        // scene.add(textGroup);

        // const loader = new FontLoader();
        // loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        //     const string = "STUDENT FREELANCER PLATFORM * ";
        //     const radius = 14; 
            
        //     for (let i = 0; i < string.length; i++) {
        //         const charGeo = new TextGeometry(string[i], {
        //             font: font,
        //             size: 1,
        //             height: 0.02,      // FIX: Để cực nhỏ (0.02) để không bị kéo dài ra màn hình
        //             curveSegments: 12,
        //             bevelEnabled: false // FIX: Tắt vát cạnh để chữ phẳng và sắc nét
        //         });

        //         // CỰC KỲ QUAN TRỌNG: Đưa tâm chữ về giữa để không bị méo khi xoay
        //         charGeo.center(); 

        //         // Sử dụng MeshBasicMaterial để chữ rõ nét nhất
        //         const charMat = new THREE.MeshBasicMaterial({ 
        //             color: 0x3b82f6,
        //             transparent: true,
        //             opacity: 0.8
        //         });
                
        //         const charMesh = new THREE.Mesh(charGeo, charMat);

        //         const angle = (i / string.length) * Math.PI * 2;
        //         charMesh.position.x = Math.cos(angle) * radius;
        //         charMesh.position.z = Math.sin(angle) * radius;

        //         // Xoay chữ hướng mặt thẳng về tâm/camera
        //         charMesh.rotation.y = -angle + Math.PI / 2;
                
        //         textGroup.add(charMesh);
        //     }
        // });

        // 3. Sao nền
        const starsGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(8000 * 3);
        for(let i = 0; i < 5000; i++) posArray[i] = (Math.random() - 0.5) * 100;
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starsMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff });
        const starMesh = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starMesh);

        // Lùi Camera ra xa để thấy rõ vòng chữ (Fix cảm giác bị kéo dài do quá gần)
        camera.position.z = 40; 

        const clock = new THREE.Clock();
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            coreMesh.rotation.y = elapsedTime * 0.3;
            coreMesh.rotation.x = elapsedTime * 0.1;

            // Xoay vòng chữ quanh quả cầu (Tốc độ vừa phải)
            // textGroup.rotation.y = -elapsedTime * 0.4; 

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (mountRef.current) mountRef.current.innerHTML = "";
            renderer.dispose();
            coreGeo.dispose();
            coreMat.dispose();
        };
    }, []);

    return (
        <div ref={mountRef} style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            zIndex: -1, background: '#020617', pointerEvents: 'none' 
        }} />
    );
};

export default ThreeBg;