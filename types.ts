export interface WorkItem {
  id: number;
  color: string;
  image?: string;
  title: string;
  category: string;
  description: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface TileCoordinate {
  key: string;
  x: number;
  y: number;
}