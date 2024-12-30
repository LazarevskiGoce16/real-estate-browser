import { Component, Input, OnInit } from '@angular/core';
import { BuildingService } from '../../services/building.service';
import { CommonModule } from '@angular/common';
import { Apartment } from '../../models/building.model';
import { Booking } from '../../models/booking.model';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid'; 

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './apartment-list.component.html',
  styleUrls: ['./apartment-list.component.css']
})
export class ApartmentListComponent implements OnInit {
  @Input() 
  buildingId?: number;

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

  constructor(
    private buildingService: BuildingService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeCalendarOptions();

    if (this.buildingId) {
      this.buildingService.getBuildingById(this.buildingId).subscribe(
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
    const buildingId = this.buildingId ?? 0;
    
    this.buildingService.getBookings().pipe(
      switchMap(bookings => {
        const validIds = bookings.map(b => b.id).filter(id => !isNaN(id));
        const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
        const nextId = maxId + 1;
        console.log(nextId);

        const newBooking: Booking = {
          id: nextId,
          buildingId: buildingId,
          apartmentId: apartment.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };

        console.log(newBooking)
        return this.buildingService.bookApartment(newBooking, apartment);
      })
    ).subscribe(
      booking => {
        this.calendarOptions.events = [
          ...this.calendarOptions.events as any,
          {
            title: `Apartment ${booking.apartmentId} booked`,
            start: booking.startDate,
            end: booking.endDate
          }
        ];
      },
      error => {
        this.errorMessage = 'Error booking apartment';
        console.error('Error booking apartment', error);
      }
    );

    apartment.status = 'booked';
    this.updateApartmentStatus(apartment);
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
    const apartmentIds = this.apartments.map(a => a.id);
    if (apartmentIds.length === 0) return;

    this.buildingService.getBookings().subscribe(
      allBookings => {
        const filteredBookings = allBookings.filter(booking =>
          apartmentIds.includes(booking.apartmentId)
        );
        console.log(filteredBookings);

        this.calendarOptions.events = filteredBookings.map(booking => ({
          title: `Apartment ${booking.apartmentId} booked`,
          start: booking.startDate,
          end: booking.endDate
        }));
      },
      error => {
        this.errorMessage = 'Error fetching bookings';
        console.error('Error fetching bookings', error);
      }
    );
  }

  private updateApartmentStatus(apartment: Apartment): void {
    if (!this.buildingId) return;

    this.buildingService.getBuildingById(this.buildingId).subscribe(
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

  showDetails() {
    this.router.navigate(['building', this.buildingId]);
  }
}