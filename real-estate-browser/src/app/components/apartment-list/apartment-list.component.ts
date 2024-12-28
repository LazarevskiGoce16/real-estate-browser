import { Component, Input, OnInit } from '@angular/core';
import { CalendarEvent, CalendarModule, CalendarView, CalendarUtils, CalendarCommonModule, DateAdapter, CalendarA11y, CalendarDateFormatter, CalendarEventTitleFormatter } from 'angular-calendar';
import { BuildingService } from '../../services/building.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Apartment } from '../../models/building.model';
import { Booking } from '../../models/booking.model';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule, CalendarModule, CalendarCommonModule],
  providers: [
    { provide: DateAdapter, useFactory: adapterFactory},
    CalendarUtils,
    CalendarA11y,
    CalendarDateFormatter,
    CalendarEventTitleFormatter
  ],
  templateUrl: './apartment-list.component.html',
  styleUrls: ['./apartment-list.component.css']
})
export class ApartmentListComponent implements OnInit {
  @Input() buildingId?: number;
  apartments: Apartment[] = [];
  bookings: Booking[] = [];
  errorMessage: string = '';

  viewDate: Date = new Date;
  events: CalendarEvent[] = [];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;

  constructor(private buildingService: BuildingService, private http: HttpClient) { }

  ngOnInit(): void {
    if (this.buildingId) {
      this.buildingService.getBuilding(this.buildingId).subscribe(
        building => {
          this.apartments = building.apartments;
          this.loadBookings();
      },
      error => {
        this.errorMessage = 'Error fetching apartments';
        console.error('Error fetching apartments:', error);
      }
    )};
  }

  bookApartment(apartment: Apartment, startDate: Date, endDate: Date): void {
    const newBooking: Booking = {
      id: 0,
      apartmentId: apartment.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };

    this.http.post<Booking>('http://localhost:3000/bookings', newBooking).subscribe(
      booking => {
        this.events.push({
          start: new Date(booking.startDate),
          end: new Date(booking.endDate),
          title: `Apartment ${booking.apartmentId} booked`,
          color: { primary: '#e3bc08', secondary: '#fdf1ba'}
        });

        apartment.status = 'booked';
        this.updateApartmentStatus(apartment);
      }, 
      error => {
        this.errorMessage = 'Error booking apartment';
        console.error('Error booking apartment:', error);
      }
    );
  }

  buyApartment(apartment: Apartment): void {
    apartment.status = 'sold';
    this.updateApartmentStatus(apartment);
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  viewDateChanged(date: Date): void {
    this.viewDate = date;
  }

  private loadBookings(): void {
    const bookingsUrl = `http://localhost:3000/bookings?apartmentId=${this.apartments.map(
      a => a.id).join('&apartmendId=')}`;
    this.http.get<Booking[]>(bookingsUrl).subscribe(
      bookings => {
        this.events = bookings.map(booking => ({
          start: new Date(booking.startDate),
          end: new Date(booking.endDate),
          title: `Apartment ${booking.apartmentId} booked`,
          color: { primary: '#e3bc08', secondary: '#fdf1ba'}
        }));
      },
      error => {
        this.errorMessage = 'Error fetching bookings';
        console.error('Error fetching bookings:', error);
      }
    );
  }

  private updateApartmentStatus(apartment: Apartment): void {
    if (!this.buildingId) return;

    this.buildingService.getBuilding(this.buildingId).subscribe(
      building => {
        const apartmentIndex = building.apartments.findIndex(a => a.id === apartment.id);
        if (apartmentIndex !== -1) {
          building.apartments[apartmentIndex].status = apartment.status;
          this.buildingService.updateBuilding(building).subscribe(
            () => {
              console.log('Successfully updated the building status!');
            },
            error => {
              this.errorMessage = `Error updating apartment status to ${apartment.status}`;
              console.error(`Error updating apartment status to ${apartment.status}:`, error);
            }
          );
        }
      },
      error => {
        this.errorMessage = `Error fetching building with ID ${this.buildingId}`;
        console.error(`Error fetching building with ID ${this.buildingId}:`, error);
      }
    );
  }
}