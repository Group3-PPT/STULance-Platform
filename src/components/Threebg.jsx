import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

        // 2. Vòng chữ kiểu Thổ Tinh — dùng PlaneGeometry luôn hướng ra ngoài
        const textGroup = new THREE.Group();
        textGroup.rotation.x = 0.3;
        scene.add(textGroup);

        const createTextPlane = (text, fontSize, color) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 128, 32);

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;

            const mat = new THREE.MeshBasicMaterial({ 
                map: texture, 
                transparent: true, 
                side: THREE.DoubleSide,
                depthWrite: false 
            });
            const geo = new THREE.PlaneGeometry(5, 1.2);
            const mesh = new THREE.Mesh(geo, mat);
            return mesh;
        };

        // Vòng trong
        const text1 = "STUDENT FREELANCER PLATFORM  •  ";
        const chars1 = text1.split('');
        const radius1 = 13;
        const group1 = new THREE.Group();

        chars1.forEach((char, i) => {
            const mesh = createTextPlane(char, 36, 'rgba(59, 130, 246, 0.8)');
            const angle = (i / chars1.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius1;
            const z = Math.sin(angle) * radius1;
            mesh.position.set(x, 0, z);
            // Hướng mặt phẳng ra ngoài tâm
            mesh.lookAt(0, 0, 0);
            mesh.rotateY(Math.PI);
            group1.add(mesh);
        });
        textGroup.add(group1);

        // Vòng ngoài
        const text2 = "KẾT NỐI  ★  SINH VIÊN  ★  DOANH NGHIỆP  ★  ";
        const chars2 = text2.split('');
        const radius2 = 16;
        const group2 = new THREE.Group();

        chars2.forEach((char, i) => {
            const mesh = createTextPlane(char, 30, 'rgba(96, 165, 250, 0.6)');
            const angle = (i / chars2.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius2;
            const z = Math.sin(angle) * radius2;
            mesh.position.set(x, 0, z);
            mesh.lookAt(0, 0, 0);
            mesh.rotateY(Math.PI);
            group2.add(mesh);
        });
        textGroup.add(group2);

        // 3. Sao nền
        const starsGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(8000 * 3);
        for(let i = 0; i < 8000; i++) posArray[i] = (Math.random() - 0.5) * 100;
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starsMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff });
        const starMesh = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starMesh);

        camera.position.z = 40; 

        const clock = new THREE.Clock();
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            coreMesh.rotation.y = elapsedTime * 0.3;
            coreMesh.rotation.x = elapsedTime * 0.1;

            group1.rotation.y = elapsedTime * 0.2;
            group2.rotation.y = -elapsedTime * 0.15;

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
