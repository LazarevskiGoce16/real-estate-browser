import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Apartment, Building } from '../models/building.model';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {

  private apiUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(`${this.apiUrl}/buildings`);
  }

  getBuildingById(buildingId: number): Observable<Building> {
    return this.http.get<Building>(`${this.apiUrl}/buildings/${buildingId}`);
  }

  getBookings(): Observable<Booking[]> {
    const url = `${this.apiUrl}/bookings`;
    return this.http.get<Booking[]>(url);
  }

  getBookingById(apartmentIds: number[]): Observable<Booking[]> {
    const query = apartmentIds.map(id => `apartmentId=${id}`).join('&');
    const url = `${this.apiUrl}/bookings?${query}`;
    return this.http.get<Booking[]>(url);
  }

  updateBuilding(building: Building): Observable<Building> {
    return this.http.put<Building>(`${this.apiUrl}/buildings/${building.id}`, building);
  }

  bookApartment(newBooking: Booking, apartment: Apartment): Observable<Booking> {
    return new Observable(observer => {
      const url = `${this.apiUrl}/bookings`
      this.http.post<Booking>(url, newBooking).subscribe(
        booking => {
          apartment.status = 'booked';
          observer.next(booking);
          observer.complete();
        },
        error => {
          observer.error('Error booking apartment');
          console.error('Error booking apartment:', error);
        }
      );
    });
  }
}
