import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Dimensions, ScaledSize } from "react-native";

interface DimensionsContextType {
  screen: ScaledSize;
  screenWidth: number;
  screenHeight: number;
}

const DimensionsContext = createContext<DimensionsContextType | undefined>(
  undefined
);

interface DimensionsProviderProps {
  children: ReactNode;
}

export const DimensionsProvider: React.FC<DimensionsProviderProps> = ({
  children,
}) => {
  const [dimensions, setDimensions] = useState(() => {
    const screen = Dimensions.get("screen");

    const initialDimensions = {
      screen,
      screenWidth: screen.width,
      screenHeight: screen.height,
    };

    console.log("[DimensionsContext] Initial dimensions retrieved:", {
      screen: `${screen.width}x${screen.height}`,
      orientation: screen.width > screen.height ? "landscape" : "portrait",
    });

    return initialDimensions;
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ screen }) => {
      const newDimensions = {
        screen,
        screenWidth: screen.width,
        screenHeight: screen.height,
      };

      console.log("[DimensionsContext] Dimensions changed:", {
        screen: `${screen.width}x${screen.height}`,
        orientation: screen.width > screen.height ? "landscape" : "portrait",
        previousOrientation:
          dimensions.screenWidth > dimensions.screenHeight
            ? "landscape"
            : "portrait",
      });

      setDimensions(newDimensions);
    });

    return () => subscription?.remove();
  }, [dimensions.screenWidth, dimensions.screenHeight]);

  return (
    <DimensionsContext.Provider value={dimensions}>
      {children}
    </DimensionsContext.Provider>
  );
};

export const useDimensions = (): DimensionsContextType => {
  const context = useContext(DimensionsContext);
  if (context === undefined) {
    throw new Error("useDimensions must be used within a DimensionsProvider");
  }
  return context;
};
