import React from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";

interface BubblyChatBubbleProps {
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  textColor?: string;
  bubbleColor?: string;
  backgroundColor?: string;
}

export default function BubblyChatBubble({
  width,
  height,
  text,
  fontSize = 24,
  textColor = "#654321",
  bubbleColor = "#F8F8F0",
  backgroundColor = "transparent",
}: BubblyChatBubbleProps) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @keyframes gyrate {
          0% {
            transform: scaleY(0.95) scaleX(0.9);
          }
          100% {
            transform: scaleY(1) scaleX(1);
          }
        }

        @keyframes gyrate2 {
          0% {
            transform: scale(0.9) scaleX(0.98);
          }
          100% {
            transform: scaleY(1.2) scaleX(1);
          }
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scaleY(0.95);
          }
          100% {
            transform: translate(-50%, -50%) scaleY(1);
          }
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: ${backgroundColor};
          color: ${textColor};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow: hidden;
        }

        #container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px; /* Increased padding for better spacing */
          box-sizing: border-box;
        }

        svg {
          animation: pulse 4.5s ease-in-out 0s alternate infinite;
          fill: ${bubbleColor};
          filter: drop-shadow(3px 6px 8px rgba(0,0,0,.15));
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%) scale(1.1);
          width: 100%; /* Full width to accommodate text */
          height: 100%; /* Full height to prevent clipping */
          max-width: none;
          max-height: none;
        }

        path {
          animation: gyrate 2s ease-in-out 0s alternate infinite;
          transform-origin: 50% 50%;
        }

        #shape2 {
          animation: gyrate2 2.2s ease-in-out .3s alternate infinite;
          transform-origin: 50% 100%;
        }
      </style>
    </head>
    <body>
      <div id="container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 665 316" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="blubby" x="-10%" y="-10%" width="120%" height="120%" filterUnits="objectBoundingBox">
              <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="20"/>
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"/>
            </filter>
          </defs>
          <g class="shapes" filter="url(#blubby)">
            <path id="shape1" d="M647.49,106.85c0-82.72-69.8-93.3-121.5-98.11S407.2,2,281.5,2,125.7,3.92,74,8.74.66,24,.66,106.7c0,63.49,6.23,85.09,38.93,102.12C61.14,225,162.91,238.39,281.5,238.39s225.67-5.83,311.77-28.54c48.94-21.35,57.22-36.23,57.22-103Z"/>
            <path id="shape2" d="M634.05,235.52c0-49-66.24-55.3-105.67-58.15s-96.66-4-186.94-4-167.52,1.14-186.95,4-117.39,9-117.39,58.06c0,37.63,8.79,50.43,36.87,60.53,28,9.58,145.92,17.52,267.47,17.52S536,310,589.49,296.57c46.51-12.65,49.56-21.47,49.56-61Z"/>
          </g>
        </svg>
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <View style={{ width, height, position: "relative" }}>
      <WebView
        source={{ html: htmlContent }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scalesPageToFit={false}
        javaScriptEnabled={true}
        domStorageEnabled={false}
        startInLoadingState={false}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={["*"]}
      />

      {/* Text overlay using React Native Text with proper font */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: width * 0.15, // Dynamic padding based on bubble width (15% on each side)
          paddingVertical: height * 0.2, // Dynamic vertical padding (20% top/bottom)
          pointerEvents: "none",
        }}
      >
        <Text
          style={{
            fontSize: fontSize,
            color: textColor,
            textAlign: "center",
            fontFamily: "SuperAdorable",
            letterSpacing: 0.3,
            lineHeight: fontSize * 1.2, // Better line height for wrapped text
            textShadowColor: "rgba(255, 255, 255, 0.8)",
            textShadowOffset: { width: 0, height: 0.5 },
            textShadowRadius: 1,
            maxWidth: width * 0.7, // Constrain text width to 70% of bubble width
            flexShrink: 1, // Allow text to shrink if needed
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}
