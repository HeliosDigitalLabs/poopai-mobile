import { track, init, identify, Identify, setUserId } from '@amplitude/analytics-react-native';

const AMPLITUDE_API_KEY = 'af588717a7c51318c70162aef09a4ddf'; // Replace this

export const initAnalytics = () => {
  init(AMPLITUDE_API_KEY, undefined, {
    flushIntervalMillis: 10000,
    trackingSessionEvents: true,
  });
};

export const logEvent = (eventName: string, props?: Record<string, any>) => {
  track(eventName, props || {});
};

export const setUser = (userId: string) => {
  setUserId(userId);
};

export const setUserTraits = (traits: Record<string, any>) => {
  const identifyObj = new Identify();
  for (const key in traits) {
    identifyObj.set(key, traits[key]);
  }
  identify(identifyObj);
};

