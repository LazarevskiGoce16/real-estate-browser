import { Component, Input, OnInit } from '@angular/core';
import { BuildingService } from '../../services/building.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Apartment } from '../../models/building.model';
import { Booking } from '../../models/booking.model';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './apartment-list.component.html',
  styleUrls: ['./apartment-list.component.css']
})
export class ApartmentListComponent implements OnInit {
  @Input() buildingId?: number;
  apartments: Apartment[] = [];
  bookings: Booking[] = [];
  errorMessage: string = '';
  viewDate: Date = new Date();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    editable: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }
  };

  constructor(private buildingService: BuildingService, private http: HttpClient) { }

  ngOnInit(): void {
    this.initializeCalendarOptions();

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

  initializeCalendarOptions(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: [],
      editable: false,
      selectable: true,
      select: this.handleDateSelect.bind(this),
    };
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
        this.calendarOptions.events = [
          ...this.calendarOptions.events as any,
          {
            title: `Apartment ${booking.apartmentId} booked`,
            start: booking.startDate,
            end: booking.endDate
          }
        ];

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

  handleDateSelect(selectInfo: any): void {
    console.log('Date selected:', selectInfo.startStr);
  }

  private loadBookings(): void {
    const bookingsUrl = `http://localhost:3000/bookings?apartmentId=${this.apartments.map(
      a => a.id).join('&apartmendId=')}`;

    this.http.get<Booking[]>(bookingsUrl).subscribe(
      bookings => {
        this.calendarOptions.events = bookings.map(booking => ({
          title: `Apartment ${booking.apartmentId} booked`,
          start: booking.startDate,
          end: booking.endDate
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
              console.log(`Apartment ${apartment.id} status updated to ${apartment.status}`);
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