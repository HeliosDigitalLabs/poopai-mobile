import React from "react";
import {
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Filter,
  FeGaussianBlur,
  FeDropShadow,
} from "react-native-svg";

interface ChatBubbleSvgProps {
  width: number;
  height: number;
  tailPosition?: "left" | "right" | "bottom-left" | "bottom-right";
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export default function ChatBubbleSvg({
  width,
  height,
  tailPosition = "bottom-left",
  fillColor = "rgba(255, 255, 255, 0.4)",
  strokeColor = "rgba(255, 255, 255, 0.6)",
  strokeWidth = 1.5,
}: ChatBubbleSvgProps) {
  const borderRadius = 18;
  const tailSize = 10;

  // Calculate the main bubble dimensions (accounting for tail)
  const bubbleWidth = width;
  const bubbleHeight = height - tailSize;

  // Create the path for a rounded rectangle with a tail
  const createBubblePath = () => {
    const r = borderRadius; // radius
    const w = bubbleWidth;
    const h = bubbleHeight;

    // Tail position calculations
    const tailX = tailPosition.includes("left") ? 30 : w - 30;
    const tailY = h;

    // Main rounded rectangle path
    let path = `M ${r} 0`;
    path += ` L ${w - r} 0`;
    path += ` Q ${w} 0 ${w} ${r}`;
    path += ` L ${w} ${h - r}`;
    path += ` Q ${w} ${h} ${w - r} ${h}`;

    // Add tail at the bottom
    if (tailPosition === "bottom-left") {
      path += ` L ${tailX + tailSize} ${h}`;
      path += ` L ${tailX} ${h + tailSize}`;
      path += ` L ${tailX - tailSize} ${h}`;
    }

    path += ` L ${r} ${h}`;
    path += ` Q 0 ${h} 0 ${h - r}`;
    path += ` L 0 ${r}`;
    path += ` Q 0 0 ${r} 0`;
    path += ` Z`;

    return path;
  };

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        {/* Gradient for the bubble */}
        <LinearGradient id="bubbleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
          <Stop offset="30%" stopColor="rgba(255, 248, 220, 0.4)" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
        </LinearGradient>

        {/* Glow gradient for outer effect */}
        <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(139, 69, 19, 0.2)" />
          <Stop offset="100%" stopColor="rgba(139, 69, 19, 0.1)" />
        </LinearGradient>

        {/* Drop shadow filter */}
        <Filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <FeDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="rgba(0, 0, 0, 0.15)"
          />
        </Filter>

        {/* Glow filter */}
        <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur stdDeviation="4" result="coloredBlur" />
        </Filter>
      </Defs>

      {/* Outer glow */}
      <Path
        d={createBubblePath()}
        fill="url(#glowGradient)"
        filter="url(#glow)"
        transform="scale(1.05)"
      />

      {/* Main bubble with drop shadow */}
      <Path
        d={createBubblePath()}
        fill="url(#bubbleGradient)"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#dropShadow)"
      />

      {/* Top highlight line */}
      <Path
        d={`M ${borderRadius} 1 L ${bubbleWidth - borderRadius} 1 Q ${bubbleWidth - 1} 1 ${bubbleWidth - 1} ${borderRadius}`}
        stroke="rgba(255, 255, 255, 0.7)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
