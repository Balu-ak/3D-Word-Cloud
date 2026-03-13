import { Suspense, useEffect, useRef, useState } from "react";

import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

import type { AnalysisResponse } from "../types/analysis";

type WordCloudStageProps = {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
};

type WordNodeProps = {
  index: number;
  total: number;
  weight: number;
  word: string;
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export default function WordCloudStage({
  analysis,
  isLoading,
}: WordCloudStageProps) {
  const hasWords = Boolean(analysis && analysis.word_cloud.length > 0);

  return (
    <section className="stage-panel">
      <div className="stage-copy">
        <p className="eyebrow">Visualization Prep</p>
        <h2>3D topic field</h2>
        <p>
          Weighted terms are now rendered in a deterministic 3D layout so the
          scene stays stable, readable, and ready for richer interaction.
        </p>
      </div>

      <div className="stage-frame">
        <div className="orbit orbit-a" />
        <div className="orbit orbit-b" />
        <div className="orbit orbit-c" />
        <div className="stage-overlay-label">Article Semantic Map</div>

        {isLoading ? (
          <p className="stage-placeholder">Building the topic map...</p>
        ) : null}

        {!isLoading && !analysis ? (
          <p className="stage-placeholder">
            The 3D word cloud will appear here after the first analysis run.
          </p>
        ) : null}

        {!isLoading && analysis && !hasWords ? (
          <p className="stage-placeholder">
            This article did not return enough weighted terms to render the 3D
            cloud yet.
          </p>
        ) : null}

        {!isLoading && analysis && hasWords ? (
          <div className="stage-canvas">
            <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.75]}>
              <color attach="background" args={["#07101d"]} />
              <fog attach="fog" args={["#07101d", 6, 16]} />
              <ambientLight intensity={1.1} />
              <directionalLight position={[4, 5, 6]} intensity={0.9} />
              <directionalLight position={[-4, -2, 4]} intensity={0.45} />

              <Suspense fallback={null}>
                <WordCloudScene words={analysis.word_cloud} />
              </Suspense>

              <OrbitControls
                enablePan={false}
                enableZoom
                maxDistance={12}
                minDistance={4}
              />
            </Canvas>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WordCloudScene({
  words,
}: {
  words: AnalysisResponse["word_cloud"];
}) {
  const cloudRef = useRef<Group | null>(null);

  useFrame((state, delta) => {
    if (!cloudRef.current) {
      return;
    }

    cloudRef.current.rotation.y += delta * 0.07;
    cloudRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.12;
  });

  return (
    <group ref={cloudRef}>
      {words.map((entry, index) => (
        <WordNode
          key={entry.word}
          index={index}
          total={words.length}
          word={entry.word}
          weight={entry.weight}
        />
      ))}
    </group>
  );
}

function WordNode({ index, total, weight, word }: WordNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<Group | null>(null);
  const basePosition = getWordPosition(index, total);
  const baseRotation = getWordRotation(index);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const floatOffset = Math.sin(state.clock.elapsedTime * 1.1 + index * 0.6) * 0.07;
    const targetScale = isHovered ? 1.15 : 1;
    const currentScale = groupRef.current.scale.x;
    const easedScale = currentScale + (targetScale - currentScale) * 0.12;

    groupRef.current.position.set(
      basePosition[0],
      basePosition[1] + floatOffset,
      basePosition[2]
    );
    groupRef.current.scale.setScalar(easedScale);
  });

  return (
    <group ref={groupRef} position={basePosition} rotation={baseRotation}>
      <Text
        anchorX="center"
        anchorY="middle"
        color={getWordColor(weight, isHovered)}
        fontSize={0.35 + weight * 0.9}
        maxWidth={4.4}
        onPointerOut={() => {
          document.body.style.cursor = "default";
          setIsHovered(false);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          setIsHovered(true);
        }}
      >
        {word}
      </Text>
    </group>
  );
}

function getWordPosition(index: number, total: number): [number, number, number] {
  const safeTotal = Math.max(total, 1);
  const progress = (index + 0.5) / safeTotal;
  const polar = Math.acos(1 - 2 * progress);
  const azimuth = GOLDEN_ANGLE * (index + 1);
  const radius = 2.8 + (index % 4) * 0.22;

  return [
    radius * Math.cos(azimuth) * Math.sin(polar),
    radius * Math.cos(polar) * 0.82,
    radius * Math.sin(azimuth) * Math.sin(polar),
  ];
}

function getWordRotation(index: number): [number, number, number] {
  const tiltX = Math.sin(index * 1.7) * 0.16;
  const tiltY = Math.cos(index * 1.3) * 0.18;
  const tiltZ = Math.sin(index * 0.9) * 0.08;

  return [tiltX, tiltY, tiltZ];
}

function getWordColor(weight: number, isHovered: boolean): string {
  const hue = 192 - weight * 36;
  const saturation = isHovered ? 90 : 82;
  const lightness = isHovered ? 78 : 66 + weight * 10;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
