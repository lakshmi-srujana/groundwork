"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface StampSceneProps {
  onSealLanded?: () => void;
  reducedMotion?: boolean;
}

const Stamp = ({
  onSealLanded,
  reducedMotion,
}: {
  onSealLanded?: () => void;
  reducedMotion?: boolean;
}) => {
  const group = useRef<THREE.Group>(null);
  const sealTexture = useTexture("/seal.png");
  
  // States for animation
  const [stage, setStage] = useState<"incoming" | "squish" | "lifted">(
    reducedMotion ? "lifted" : "incoming"
  );
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasNotifiedParent = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setStage("lifted");
      if (onSealLanded && !hasNotifiedParent.current) {
        hasNotifiedParent.current = true;
        onSealLanded();
      }
      return;
    }

    // Phase 1: incoming -> squish
    timerRef.current = setTimeout(() => {
      setStage("squish");
      
      // Phase 2: squish -> lifted
      timerRef.current = setTimeout(() => {
        setStage("lifted");
        
        // Phase 3: notify landed after lift animation finishes
        timerRef.current = setTimeout(() => {
          if (onSealLanded && !hasNotifiedParent.current) {
            hasNotifiedParent.current = true;
            onSealLanded();
          }
        }, 600);
      }, 80);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reducedMotion, onSealLanded]);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (reducedMotion) {
      group.current.position.y = -0.14; // Match -14px relative
      group.current.scale.set(1.04, 1.04, 1.04);
      group.current.rotation.x = THREE.MathUtils.degToRad(8);
      return;
    }

    if (stage === "incoming") {
      // Animate from y: 0.8, scale: 1.2 to y: 0, scale: 1
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 0, delta * 8);
      const scale = THREE.MathUtils.lerp(group.current.scale.x, 1, delta * 8);
      group.current.scale.set(scale, scale, scale);
    } else if (stage === "squish") {
      // Squish scaleX: 1.07, scaleY: 0.93
      group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, 1.07, delta * 15);
      group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, 0.93, delta * 15); // Z is up/down if rotated
      group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, 1.07, delta * 15);
    } else if (stage === "lifted") {
      // Lift to y: -0.14 (visual), scale: 1.04, rotateX: 8deg
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 0.2, delta * 5); // lift up
      const scale = THREE.MathUtils.lerp(group.current.scale.x, 1.04, delta * 5);
      group.current.scale.set(scale, scale, scale);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, THREE.MathUtils.degToRad(-15), delta * 5); // tip towards viewer
    }
  });

  // Start initial high for incoming
  useEffect(() => {
    if (group.current && !reducedMotion) {
      group.current.position.y = 2; // Start high above
      group.current.scale.set(1.2, 1.2, 1.2);
    }
  }, [reducedMotion]);

  return (
    <group ref={group}>
      {/* Invisible cylinder to act as the stamp volume */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      {/* The seal texture on a plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={sealTexture} transparent />
      </mesh>
    </group>
  );
};

export const StampScene: React.FC<StampSceneProps> = ({ onSealLanded, reducedMotion }) => {
  return (
    <div className="w-full h-full relative" style={{ perspective: "800px" }}>
      <Canvas shadows camera={{ position: [0, 2, 0], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 2]} intensity={1} castShadow />
        <Stamp onSealLanded={onSealLanded} reducedMotion={reducedMotion} />
        
        {/* Dynamic Soft Shadow */}
        <ContactShadows
          position={[0, -0.2, 0]}
          opacity={0.65}
          scale={5}
          blur={2.5}
          far={4}
        />
      </Canvas>
    </div>
  );
};
