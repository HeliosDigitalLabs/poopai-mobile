import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BlurContextType {
  blurByDefault: boolean;
  setBlurByDefault: (value: boolean) => void;
  initialized: boolean;
}

const BlurContext = createContext<BlurContextType | undefined>(undefined);

export const BlurProvider = ({ children }: { children: ReactNode }) => {
  const [blurByDefault, setBlurByDefaultState] = useState<boolean>(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem("blurByDefault");
      if (stored === null) {
        // First time: default to true
        await AsyncStorage.setItem("blurByDefault", JSON.stringify(true));
        setBlurByDefaultState(true);
      } else {
        setBlurByDefaultState(JSON.parse(stored));
      }
      setInitialized(true);
    };
    load();
  }, []);

  const setBlurByDefault = async (value: boolean) => {
    setBlurByDefaultState(value);
    await AsyncStorage.setItem("blurByDefault", JSON.stringify(value));
  };

  return (
    <BlurContext.Provider
      value={{ blurByDefault, setBlurByDefault, initialized }}
    >
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => {
  const ctx = useContext(BlurContext);
  if (!ctx) throw new Error("useBlur must be used within a BlurProvider");
  return ctx;
};
