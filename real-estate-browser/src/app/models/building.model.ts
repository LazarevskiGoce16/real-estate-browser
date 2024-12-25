export interface Apartment {
    id: number;
    status: string;
}
  
export interface Building {
    id: number;
    name: string;
    apartments: Apartment[];
}