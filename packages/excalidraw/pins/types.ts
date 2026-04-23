export type PinId = string & { _brand: "PinId" };

export interface Pin {
  id: PinId;
  x: number;
  y: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type PinMap = Map<PinId, Pin>;

export const PIN_STORAGE_KEY = "excalidraw-pins";

export interface PinDialogState {
  pinId: PinId | null;
  isEditing: boolean;
  initialContent: string;
}
