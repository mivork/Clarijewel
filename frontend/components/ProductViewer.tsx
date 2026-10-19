"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type Props = {
  modelUrl?: string | null;
  thumbnailUrl?: string | null;
  alt: string;
};

export default function ProductViewer({ modelUrl, thumbnailUrl, alt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelUrl || !containerRef.current) return;

    setError(null);
    const container = containerRef.current;
    const size = container.clientWidth;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x17171f);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loader = new GLTFLoader();
    let frameId = 0;
    let disposed = false;

    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        // モデルのスケール・位置はまちまちなので、表示領域に収まるよう正規化する
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);
        const scale = boxSize > 0 ? 2 / boxSize : 1;
        gltf.scene.scale.setScalar(scale);
        scene.add(gltf.scene);
      },
      undefined,
      () => setError("3Dモデルの読み込みに失敗しました。")
    );

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      renderer.setSize(w, w);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  if (!modelUrl || error) {
    return (
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius)",
          aspectRatio: "1 / 1",
          overflow: "hidden",
        }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={alt}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--color-muted)",
            }}
          >
            {error ?? "画像がありません"}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        aspectRatio: "1 / 1",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    />
  );
}
