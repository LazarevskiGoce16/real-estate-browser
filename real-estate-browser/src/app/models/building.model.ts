export interface Apartment {
    id: number;
    buildingId: number;
    status: string;
    bookPrice: number;
    buyPrice: number;
}
  
export interface Building {
    id: number;
    name: string;
    apartments: Apartment[];
}