export type ElementType =
  | "upper_cabinet"
  | "lower_cabinet"
  | "drawer"
  | "worktop"
  | "backsplash"
  | "island"
  | "side_panel"
  | "hood_casing";

export interface KitchenElement {
  id: string;
  type: ElementType;
  label: string;
  mask: number[][];
  boundingBox: { x: number; y: number; width: number; height: number };
  surfaceM2?: number;
  referenceCode?: string;
}

export interface SegmentResult {
  elements: KitchenElement[];
  imageWidth: number;
  imageHeight: number;
}
