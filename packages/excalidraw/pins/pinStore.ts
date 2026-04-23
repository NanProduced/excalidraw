import { safelyParseJSON } from "@excalidraw/common";

import { PIN_STORAGE_KEY, type Pin, type PinId, type PinMap } from "./types";

export const generatePinId = (): PinId => {
  return `pin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as PinId;
};

export const createPin = (x: number, y: number, content: string = ""): Pin => {
  const now = Date.now();
  return {
    id: generatePinId(),
    x,
    y,
    content,
    createdAt: now,
    updatedAt: now,
  };
};

export const updatePinContent = (pin: Pin, content: string): Pin => {
  return {
    ...pin,
    content,
    updatedAt: Date.now(),
  };
};

export const loadPinsFromStorage = (): PinMap => {
  const pinMap: PinMap = new Map();

  try {
    const serialized = localStorage.getItem(PIN_STORAGE_KEY);
    if (serialized) {
      const pins = safelyParseJSON(serialized);
      if (pins && Array.isArray(pins)) {
        pins.forEach((pin: Pin) => {
          pinMap.set(pin.id, pin);
        });
      }
    }
  } catch (error) {
    console.error("Failed to load pins from localStorage:", error);
  }

  return pinMap;
};

export const savePinsToStorage = (pins: PinMap): void => {
  try {
    const pinsArray = Array.from(pins.values());
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pinsArray));
  } catch (error) {
    console.error("Failed to save pins to localStorage:", error);
  }
};

export const addPin = (pins: PinMap, pin: Pin): PinMap => {
  const newPins = new Map(pins);
  newPins.set(pin.id, pin);
  savePinsToStorage(newPins);
  return newPins;
};

export const updatePin = (pins: PinMap, pinId: PinId, updates: Partial<Pin>): PinMap => {
  const existingPin = pins.get(pinId);
  if (!existingPin) {
    return pins;
  }

  const newPins = new Map(pins);
  newPins.set(pinId, {
    ...existingPin,
    ...updates,
    updatedAt: Date.now(),
  });
  savePinsToStorage(newPins);
  return newPins;
};

export const deletePin = (pins: PinMap, pinId: PinId): PinMap => {
  const newPins = new Map(pins);
  newPins.delete(pinId);
  savePinsToStorage(newPins);
  return newPins;
};
