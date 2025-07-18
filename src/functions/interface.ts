export interface ImageData {
  id?: string;
  name: string;
  description?: string;
  client?: string;
  year?: string;
  type?: string;
  size?: string;
  is360?: boolean;
  isAnimation?: boolean;
  thumbnailURL: string;
  largeURL: string;
  widthOrigin?: number;
  heightOrigin?: number;
}

// export type { ImageData };

export interface LoadableComponent {
  onLoad?: () => void;
}
