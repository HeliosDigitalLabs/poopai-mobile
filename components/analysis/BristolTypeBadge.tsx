import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { useDimensions } from "../../context/core/DimensionsContext";

interface BristolTypeBadgeProps {
  type: number;
}

// Type descriptions for each Bristol type
const TYPE_DESCRIPTIONS: { [key: number]: string } = {
  1: "Separate hard lumps",
  2: "Sausage-like but lumpy",
  3: "Like a sausage with cracks",
  4: "Ideal, healthy, well-formed",
  5: "Soft blobs with clear edges",
  6: "Fluffy pieces with ragged edges",
  7: "Watery, no solid pieces",
};

export default function BristolTypeBadge({ type }: BristolTypeBadgeProps) {
  const { screenWidth } = useDimensions();
  const description = TYPE_DESCRIPTIONS[type] || "Unknown type";

  // Function to get color scheme based on Bristol type
  const getColorScheme = (bristolType: number) => {
    switch (bristolType) {
      case 4:
        // Gold colors (current/ideal)
        return {
          primary: "oklch(0.795 0.184 86.047)", // --color-yellow-500
          primaryDark: "oklch(0.553 0.195 75.834)", // --color-yellow-700
          secondary: "oklch(0.905 0.182 98.111)", // --color-yellow-300
          light: "oklch(0.945 0.129 101.54)", // --color-yellow-200
          veryLight: "oklch(0.987 0.026 102.212)", // --color-yellow-50
          innerBg: "oklch(0.75 0.183 55.934)", // --color-orange-400
        };
      case 3:
      case 5:
        // Silver colors
        return {
          primary: "oklch(0.7 0.014 286.478)", // --color-gray-500
          primaryDark: "oklch(0.545 0.012 286.364)", // --color-gray-700
          secondary: "oklch(0.83 0.017 285.831)", // --color-gray-300
          light: "oklch(0.898 0.013 285.484)", // --color-gray-200
          veryLight: "oklch(0.98 0.008 285.106)", // --color-gray-50
          innerBg: "oklch(0.648 0.013 285.938)", // --color-gray-600
        };
      case 2:
      case 6:
        // Bronze colors
        return {
          primary: "oklch(0.646 0.222 41.116)", // --color-orange-600
          primaryDark: "oklch(0.47 0.157 37.304)", // --color-orange-800
          secondary: "oklch(0.75 0.183 55.934)", // --color-orange-400
          light: "oklch(0.837 0.128 66.29)", // --color-orange-300
          veryLight: "oklch(0.954 0.038 75.164)", // --color-orange-100
          innerBg: "oklch(0.553 0.195 38.402)", // --color-orange-700
        };
      case 1:
      case 7:
        // Red colors
        return {
          primary: "oklch(0.637 0.237 25.331)", // --color-red-600
          primaryDark: "oklch(0.495 0.205 27.33)", // --color-red-800
          secondary: "oklch(0.734 0.247 27.677)", // --color-red-400
          light: "oklch(0.828 0.186 29.234)", // --color-red-300
          veryLight: "oklch(0.971 0.043 17.38)", // --color-red-50
          innerBg: "oklch(0.568 0.213 25.855)", // --color-red-700
        };
      default:
        // Default to gold for unknown types
        return {
          primary: "oklch(0.795 0.184 86.047)",
          primaryDark: "oklch(0.553 0.195 75.834)",
          secondary: "oklch(0.905 0.182 98.111)",
          light: "oklch(0.945 0.129 101.54)",
          veryLight: "oklch(0.987 0.026 102.212)",
          innerBg: "oklch(0.75 0.183 55.934)",
        };
    }
  };

  const colors = getColorScheme(type);

  // Determine if this is an alert type (red badge)
  const isAlertType = type === 1 || type === 7;

  // Icon SVG paths
  const starIcon = `<path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m8.587 8.236l2.598-5.232a.911.911 0 0 1 1.63 0l2.598 5.232l5.808.844a.902.902 0 0 1 .503 1.542l-4.202 4.07l.992 5.75c.127.738-.653 1.3-1.32.952L12 18.678l-5.195 2.716c-.666.349-1.446-.214-1.319-.953l.992-5.75l-4.202-4.07a.902.902 0 0 1 .503-1.54z" />`;

  const exclamationIcon = `<path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M12 2v16M12 26h.01"/>`;

  const sparkleIcon = `<path fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" d="M3 12c6.268 0 9-2.637 9-9c0 6.363 2.713 9 9 9c-6.287 0-9 2.713-9 9c0-6.287-2.732-9-9-9Z" />`;

  const mainIcon = isAlertType ? exclamationIcon : starIcon;

  // Calculate responsive sizing based on screen width
  // iPad (768px+): Full size (current size)
  // iPhone Plus/Pro Max (414px+): Smaller
  // iPhone Standard (375px+): Much smaller
  // iPhone SE/Mini (360px-): Very small
  const getResponsiveSize = () => {
    if (screenWidth >= 768) {
      // iPad size - current full size but with smaller fonts
      return {
        containerWidth: 280,
        containerHeight: 100, // Increased from 85
        scale: 1.0,
        fontSize: {
          title: "0.9rem",
          description: "0.75rem",
        },
        iconSize: "4.2rem",
        innerIconSize: "2.2rem",
        gap: "0.9rem",
        paddingRight: "2.2rem",
        boxShadow:
          "0 0 15px hsl(from var(--color-orange-950) h s l / 70%) inset, 0 3px 3px hsl(from var(--color-orange-950) h s l / 40%) inset, 2px 2px 2px hsl(from var(--color-orange-100) h s l / 60%)",
      };
    } else if (screenWidth >= 414) {
      // iPhone Plus/Pro Max - significantly smaller
      return {
        containerWidth: 220,
        containerHeight: 85, // Increased from 70
        scale: 0.75,
        fontSize: {
          title: "0.99rem",
          description: "0.625rem",
        },
        iconSize: "3.2rem",
        innerIconSize: "1.4rem",
        gap: "0.7rem",
        paddingRight: "1.8rem",
        boxShadow:
          "0 0 12px hsl(from var(--color-orange-950) h s l / 70%) inset, 0 2.5px 2.5px hsl(from var(--color-orange-950) h s l / 40%) inset, 1.5px 1.5px 1.5px hsl(from var(--color-orange-100) h s l / 60%)",
      };
    } else if (screenWidth >= 375) {
      // iPhone Standard - much smaller
      return {
        containerWidth: 200,
        containerHeight: 80, // Increased from 65
        scale: 0.65,
        fontSize: {
          title: "0.65rem",
          description: "0.55rem",
        },
        iconSize: "2.9rem",
        innerIconSize: "1.2rem",
        gap: "0.6rem",
        paddingRight: "1.6rem",
        boxShadow:
          "0 0 10px hsl(from var(--color-orange-950) h s l / 70%) inset, 0 2px 2px hsl(from var(--color-orange-950) h s l / 40%) inset, 1.3px 1.3px 1.3px hsl(from var(--color-orange-100) h s l / 60%)",
      };
    } else {
      // iPhone SE/Mini - very small
      return {
        containerWidth: 180,
        containerHeight: 75, // Increased from 60
        scale: 0.55,
        fontSize: {
          title: "0.6rem",
          description: "0.5rem",
        },
        iconSize: "2.6rem",
        innerIconSize: "1rem",
        gap: "0.5rem",
        paddingRight: "1.4rem",
        boxShadow:
          "0 0 8px hsl(from var(--color-orange-950) h s l / 70%) inset, 0 1.8px 1.8px hsl(from var(--color-orange-950) h s l / 40%) inset, 1.1px 1.1px 1.1px hsl(from var(--color-orange-100) h s l / 60%)",
      };
    }
  };

  const size = getResponsiveSize();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no">
  <meta name="format-detection" content="telephone=no">
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

    html {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }

    * {
      touch-action: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -webkit-touch-callout: none !important;
      pointer-events: auto;
    }

    :root {
      /* tailwind colors */
      --color-orange-50: oklch(0.98 0.016 73.684);
      --color-orange-100: oklch(0.954 0.038 75.164);
      --color-orange-200: oklch(0.901 0.076 70.697);
      --color-orange-300: oklch(0.837 0.128 66.29);
      --color-orange-400: oklch(0.75 0.183 55.934);
      --color-orange-500: oklch(0.705 0.213 47.604);
      --color-orange-600: oklch(0.646 0.222 41.116);
      --color-orange-700: oklch(0.553 0.195 38.402);
      --color-orange-800: oklch(0.47 0.157 37.304);
      --color-orange-900: oklch(0.408 0.123 38.172);
      --color-orange-950: oklch(0.266 0.079 36.259);

      --color-yellow-50: oklch(0.987 0.026 102.212);
      --color-yellow-100: oklch(0.973 0.071 103.193);
      --color-yellow-200: oklch(0.945 0.129 101.54);
      --color-yellow-300: oklch(0.905 0.182 98.111);
      --color-yellow-400: oklch(0.852 0.199 91.936);
      --color-yellow-500: oklch(0.795 0.184 86.047);
      --color-yellow-600: oklch(0.681 0.162 75.834);
      --color-yellow-700: oklch(0.553 0.195 75.834);
      --color-yellow-800: oklch(0.478 0.177 75.847);

      /* Gray colors for silver effect */
      --color-gray-50: oklch(0.98 0.008 285.106);
      --color-gray-200: oklch(0.898 0.013 285.484);
      --color-gray-300: oklch(0.83 0.017 285.831);
      --color-gray-500: oklch(0.7 0.014 286.478);
      --color-gray-600: oklch(0.648 0.013 285.938);
      --color-gray-700: oklch(0.545 0.012 286.364);

      /* Red colors for warning effect */
      --color-red-50: oklch(0.971 0.043 17.38);
      --color-red-300: oklch(0.828 0.186 29.234);
      --color-red-400: oklch(0.734 0.247 27.677);
      --color-red-600: oklch(0.637 0.237 25.331);
      --color-red-700: oklch(0.568 0.213 25.855);
      --color-red-800: oklch(0.495 0.205 27.33);
      --color-yellow-700: oklch(0.554 0.135 66.442);
      --color-yellow-800: oklch(0.476 0.114 61.907);
      --color-yellow-900: oklch(0.421 0.095 57.708);
      --color-yellow-950: oklch(0.286 0.066 53.813);

      --color-gray-50: oklch(0.985 0 0);
      --color-gray-100: oklch(0.967 0.001 286.375);
      --color-gray-200: oklch(0.92 0.004 286.32);
      --color-gray-300: oklch(0.871 0.006 286.286);
      --color-gray-400: oklch(0.705 0.015 286.067);
      --color-gray-500: oklch(0.552 0.016 285.938);
      --color-gray-600: oklch(0.442 0.017 285.786);
      --color-gray-700: oklch(0.37 0.013 285.805);
      --color-gray-800: oklch(0.274 0.006 286.033);
      --color-gray-900: oklch(0.21 0.006 285.885);
      --color-gray-950: oklch(0.141 0.005 285.823);
    }

    body {
      margin: 0;
      padding: 0;
      background: transparent;
      color: var(--color-gray-100);
      font-family: "Inter", sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      overflow: hidden;
    }

    .achievement {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      gap: ${size.gap};
      padding-right: ${size.paddingRight};
      border-radius: 3rem;
      background: rgb(137, 115, 93);
      color: var(--color-gray-300);
    }

    .icon-outer-container {
      position: relative;
    }

    .icon-inner-container {
      position: relative;
      display: grid;
      place-items: center;
      width: ${size.iconSize};
      height: ${size.iconSize};
      border-radius: 50%;
      /* outer circle */
      background-image: radial-gradient(
        circle at center,
        ${colors.primary} 80%,
        ${colors.primaryDark} 100%
      );
      z-index: 1;
      overflow: hidden;
    }

    .icon {
      display: grid;
      place-items: center;
      width: ${size.innerIconSize};
      padding: 0.6rem;
      border-radius: inherit;
      /* inner background */
      background-color: ${colors.innerBg};
      box-shadow: ${size.boxShadow};
    }

    .icon svg {
      width: 100%;
      height: 100%;
      color: ${colors.secondary};
      filter: drop-shadow(0 0 2px ${colors.primaryDark});
    }

    .spark-container {
      position: absolute;
      inset: 0;
      z-index: 3;
    }

    .spark {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      /* centering icons */
      margin-top: calc(var(--spark-size) / 2 * -1);
      margin-left: calc(var(--spark-size) / 2 * -1);
      color: white;
      transform-origin: center center;
      animation: spark-animation 5s calc(var(--delay, 0ms) + 700ms) linear both
        infinite;
    }

    .spark svg {
      width: var(--spark-size);
      height: var(--spark-size);
    }

    .spark:nth-child(1) {
      --spark-size: ${Math.round(12 * size.scale)}px;
      --delay: 0ms;
      left: 10%;
      top: 10%;
    }
    .spark:nth-child(2) {
      --spark-size: ${Math.round(14 * size.scale)}px;
      --delay: 200ms;
      left: 100%;
      top: 35%;
    }
    .spark:nth-child(3) {
      --spark-size: ${Math.round(10 * size.scale)}px;
      --delay: 400ms;
      left: 20%;
      top: 95%;
    }

    .highlight {
      --h-color: hsla(70, 20%, 96%, 0.7);
      --h-angle: 120deg;
      --h-gap: 4px;
      --h-1-size: 4px;
      --h-2-size: 12px;
      --h-start: 40%;

      /* Calculate positions */
      --h-1-pos: calc(var(--h-start) + var(--h-1-size));
      --h-2-pos: calc(var(--h-start) + var(--h-gap) + var(--h-1-size));
      --h-end: calc(
        var(--h-start) + var(--h-gap) + var(--h-1-size) + var(--h-2-size)
      );

      content: "";
      position: absolute;
      inset: 0rem;
      z-index: -1;
      will-change: transform;
      animation: slide 5s ease-in-out both infinite;
      background-image: linear-gradient(
        var(--h-angle),
        transparent var(--h-start),
        var(--h-color) var(--h-start),
        var(--h-color) var(--h-1-pos),
        transparent var(--h-1-pos),
        transparent var(--h-2-pos),
        var(--h-color) var(--h-2-pos),
        var(--h-color) var(--h-end),
        transparent var(--h-end)
      );
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .title {
      font-size: ${size.fontSize.title};
      font-weight: 700;
      line-height: 1.25;
      color: ${colors.light};
    }

    .description {
      font-size: ${size.fontSize.description};
      line-height: 1.5;
      font-weight: 400;
      opacity: 0.75;
      color: ${colors.veryLight};
    }

    @keyframes slide {
      0% {
        transform: translateX(-100%);
      }
      50%,
      100% {
        transform: translateX(100%);
      }
    }

    @keyframes spark-animation {
      0% {
        transform: scale(0) rotate(-180deg);
      }
      8% {
        transform: scale(1) rotate(0deg);
      }
      12% {
        transform: scale(1) rotate(90deg);
      }
      16%,
      100% {
        transform: scale(0) rotate(180deg);
      }
    }

    /* Alert animations for red badges (types 1 & 7) */
    @keyframes alert-glow {
      0%, 100% {
        filter: drop-shadow(0 0 4px currentColor);
        opacity: 1;
      }
      50% {
        filter: drop-shadow(0 0 12px currentColor) drop-shadow(0 0 20px currentColor);
        opacity: 0.9;
      }
    }

    @keyframes alert-shake {
      0%, 90%, 100% {
        transform: translateX(0) translateY(0);
      }
      10% {
        transform: translateX(-0.8px) translateY(-0.5px);
      }
      20% {
        transform: translateX(0.8px) translateY(0.5px);
      }
      30% {
        transform: translateX(-0.5px) translateY(0.8px);
      }
      40% {
        transform: translateX(0.5px) translateY(-0.8px);
      }
      50% {
        transform: translateX(-0.8px) translateY(0.3px);
      }
      60% {
        transform: translateX(0.8px) translateY(-0.3px);
      }
      70% {
        transform: translateX(-0.3px) translateY(-0.5px);
      }
      80% {
        transform: translateX(0.3px) translateY(0.5px);
      }
    }

    @keyframes pulse-border {
      0%, 100% {
        box-shadow: 0 0 0 0 ${colors.primary}40;
      }
      50% {
        box-shadow: 0 0 0 6px ${colors.primary}20;
      }
    }

    /* Apply alert animations to red badges */
    .alert-mode .icon svg {
      animation: alert-glow 1.5s ease-in-out infinite;
    }

    .alert-mode .icon-inner-container {
      animation: alert-shake 2s ease-out infinite, pulse-border 1.5s ease-in-out infinite;
    }

    .alert-mode .spark-container {
      display: none; /* Hide sparkles for alert mode */
    }

    .alert-mode .highlight {
      display: none; /* Hide glimmer highlights for alert mode */
    }
  </style>
</head>
<body>
  <div class="achievement${isAlertType ? " alert-mode" : ""}">
    <div class="icon-outer-container">
      ${
        !isAlertType
          ? `<div class="spark-container">
        <div class="spark">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            ${sparkleIcon}
          </svg>
        </div>
        <div class="spark">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            ${sparkleIcon}
          </svg>
        </div>
        <div class="spark">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            ${sparkleIcon}
          </svg>
        </div>
      </div>`
          : ""
      }
      <div class="icon-inner-container">
        ${!isAlertType ? '<div class="highlight"></div>' : ""}
        <div class="icon">
          ${!isAlertType ? '<div class="highlight" style="opacity: 0.25; z-index: 2;"></div>' : ""}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 28">${mainIcon}
          </svg>
        </div>
      </div>
    </div>

    <div class="content">
      <span class="title">BRISTOL TYPE ${type}</span>
      <span class="description">${description}</span>
    </div>
  </div>

  <script>
    // Prevent all zoom and touch gestures
    document.addEventListener('gesturestart', function(e) { e.preventDefault(); e.stopPropagation(); }, { passive: false });
    document.addEventListener('gesturechange', function(e) { e.preventDefault(); e.stopPropagation(); }, { passive: false });
    document.addEventListener('gestureend', function(e) { e.preventDefault(); e.stopPropagation(); }, { passive: false });
    
    document.addEventListener('touchstart', function(e) { 
      if (e.touches.length > 1) { 
        e.preventDefault(); 
        e.stopPropagation(); 
      } 
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) { 
      if (e.touches.length > 1) { 
        e.preventDefault(); 
        e.stopPropagation(); 
      } 
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) { 
      if (e.touches.length > 1) { 
        e.preventDefault(); 
        e.stopPropagation(); 
      } 
    }, { passive: false });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
        e.stopPropagation();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Prevent wheel zoom
    document.addEventListener('wheel', function(e) {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });

    // Override zoom functions
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
  </script>
</body>
</html>
  `;

  return (
    <View
      style={{
        height: size.containerHeight,
        width: size.containerWidth,
        backgroundColor: "transparent",
      }}
    >
      <WebView
        source={{ html }}
        style={{ backgroundColor: "transparent" }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="compatibility"
        androidLayerType="hardware"
        scalesPageToFit={false}
        userInteractionEnabled={false}
        allowsInlineMediaPlayback={false}
        mediaPlaybackRequiresUserAction={true}
        allowsBackForwardNavigationGestures={false}
        dataDetectorTypes="none"
      />
    </View>
  );
}
