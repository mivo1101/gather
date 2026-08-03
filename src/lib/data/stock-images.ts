export type StockImageOrientation =
  | "all"
  | "landscape"
  | "portrait"
  | "squarish";

export interface StockImage {
  id: string;
  width: number;
  height: number;
  color: string | null;
  description: string;
  thumbnailUrl: string;
  imageUrl: string;
  photoUrl: string;
  downloadLocation: string;
  photographer: {
    name: string;
    profileUrl: string;
  };
}

export interface StockImagePage {
  photos: StockImage[];
  page: number;
  totalPages: number;
  hasMore: boolean;
  requestsRemaining: number | null;
}
