"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface StampSceneProps {
  onSealLanded?: () => void;
  reducedMotion?: boolean;
  /** Increment this value from outside to replay the stamp animation */
  replayKey?: number;
}

// ─── Stamp Inner Component ───────────────────────────────────────────────────

const StampInner: React.FC<StampSceneProps> = ({
  onSealLanded,
  reducedMotion = false,
  replayKey = 0,
}) => {
  const sealRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const texture = useTexture("/seal.png");

  const elapsedRef = useRef(0);
  const landedNotifiedRef = useRef(false);

  // Reset animation timer & state on replayKey change or mount
  useEffect(() => {
    elapsedRef.current = 0;
    landedNotifiedRef.current = false;
  }, [replayKey]);

  useFrame((_state, delta) => {
    if (reducedMotion) {
      elapsedRef.current += delta;
      const floatY = 0.4 + Math.sin(elapsedRef.current * ((Math.PI * 2) / 3)) * 0.06;
      if (sealRef.current) {
        sealRef.current.position.set(0, floatY, 0);
        sealRef.current.scale.set(1.0, 1.0, 1.0);
        sealRef.current.rotation.set(-0.18, 0, 0);
      }
      if (materialRef.current) {
        materialRef.current.opacity = 1.0;
      }
      if (onSealLanded && !landedNotifiedRef.current) {
        landedNotifiedRef.current = true;
        onSealLanded();
      }
      return;
    }

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    // 1. Fade-In & Initial Approach (0.00s to 0.35s):
    // Smoothly fades in from opacity 0 to 1 while zooming in slightly from scale 1.35 to 1.0
    if (elapsed < 0.35) {
      const progress = Math.min(elapsed / 0.35, 1);
      const easeIn = progress * progress;
      const opacity = progress; // smooth fade in
      const currentScale = 1.35 - easeIn * 0.35; // 1.35 -> 1.0
      const currentZ = (1 - easeIn) * 0.6; // z depth approach 0.6 -> 0

      if (sealRef.current) {
        sealRef.current.position.set(0, 0, currentZ);
        sealRef.current.scale.set(currentScale, currentScale, 1.0);
        sealRef.current.rotation.set(0, 0, 0);
      }
      if (materialRef.current) {
        materialRef.current.opacity = opacity;
      }
    }
    // 2. Press & Release Morphism Phase (0.35s to 0.85s):
    // Impact press down -> Elastic squish -> Sticky peel release up to y=0.4
    else if (elapsed >= 0.35 && elapsed < 0.85) {
      if (onSealLanded && !landedNotifiedRef.current) {
        landedNotifiedRef.current = true;
        onSealLanded();
      }

      if (materialRef.current) {
        materialRef.current.opacity = 1.0;
      }

      const tAnim = elapsed - 0.35; // 0.0s to 0.5s

      let scaleX = 1.0;
      let scaleY = 1.0;
      let posY = 0.0;
      let rotX = 0.0;

      // Heavy Press Phase (0.0s to 0.12s after impact):
      if (tAnim < 0.12) {
        const pPress = tAnim / 0.12;
        scaleX = THREE.MathUtils.lerp(1.0, 1.24, pPress);
        scaleY = THREE.MathUtils.lerp(1.0, 0.72, pPress);
        posY = THREE.MathUtils.lerp(0.0, -0.12, pPress);
        rotX = 0.0;
      }
      // Release & Recoil Phase (0.12s to 0.50s):
      else {
        const pRelease = (tAnim - 0.12) / 0.38;
        const easeRelease = 1 - Math.pow(1 - pRelease, 3); // ease-out cubic peel

        const springRecoil = Math.sin(pRelease * Math.PI) * 0.14;
        scaleX = THREE.MathUtils.lerp(1.24, 1.0, easeRelease) - springRecoil * 0.5;
        scaleY = THREE.MathUtils.lerp(0.72, 1.0, easeRelease) + springRecoil;

        posY = THREE.MathUtils.lerp(-0.12, 0.4, easeRelease);
        rotX = THREE.MathUtils.lerp(0, -0.18, easeRelease);
      }

      if (sealRef.current) {
        sealRef.current.position.set(0, posY, 0);
        sealRef.current.scale.set(scaleX, scaleY, 1.0);
        sealRef.current.rotation.set(rotX, 0, 0);
      }
    }
    // 3. Settled Idle Float Phase (>= 0.85s):
    // Floating sine wave on Y only, 3s period, 0.06 amplitude. Zero Y-axis rotation ever.
    else {
      if (onSealLanded && !landedNotifiedRef.current) {
        landedNotifiedRef.current = true;
        onSealLanded();
      }

      if (materialRef.current) {
        materialRef.current.opacity = 1.0;
      }

      const idleTime = elapsed - 0.85;
      const floatY = 0.4 + Math.sin(idleTime * ((Math.PI * 2) / 3)) * 0.06;

      if (sealRef.current) {
        sealRef.current.position.set(0, floatY, 0);
        sealRef.current.scale.set(1.0, 1.0, 1.0);
        sealRef.current.rotation.set(-0.18, 0, 0);
      }
    }
  });

  return (
    <group>
      {/* Main Wax Seal Mesh (3.1 x 3.1 units) */}
      <mesh ref={sealRef} position={[0, 0, 0]}>
        <planeGeometry args={[3.1, 3.1]} />
        <meshStandardMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={0}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
};

// ─── Scene Export ─────────────────────────────────────────────────────────────

export const StampScene: React.FC<StampSceneProps> = ({
  onSealLanded,
  reducedMotion = false,
  replayKey = 0,
}) => {
  return (
    <div
      className="w-full h-full relative"
      style={{ width: "100%", height: "100%", minHeight: "220px", background: "transparent" }}
    >
      <Canvas
        camera={{ position: [0, 0.2, 5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Lighting Rig */}
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 3, 2]} intensity={2} color="#ffcc77" />
        <pointLight position={[-2, 1, -1]} intensity={0.4} color="#aaddff" />

        <Suspense fallback={null}>
          <StampInner
            onSealLanded={onSealLanded}
            reducedMotion={reducedMotion}
            replayKey={replayKey}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default StampScene;
