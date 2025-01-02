import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Apartment } from '../../models/building.model';
import { Booking } from '../../models/booking.model';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { BuildingService } from '../../services/building.service';
import { ActivatedRoute, Router } from '@angular/router';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-apartment-details',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './apartment-details.component.html',
  styleUrl: './apartment-details.component.css'
})
export class ApartmentDetailsComponent implements OnInit{
  @Input()
  buildingId?: number | undefined = 1;

  apartments: Apartment[] = [];
  bookings: Booking[] = [];
  errorMessage: string = '';
  viewDate: Date = new Date;

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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeCalendarOptions();
    this.route.paramMap.subscribe(params => {
      this.buildingId = Number(params.get('id'));
      if (this.buildingId) {
        this.loadBuilding();
      } else {
        this.errorMessage = 'Invalid Building ID';
        this.router.navigate(['buildings']);
        return;
      }
    });
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

  handleDateSelect(selectInfo: any): void {
    console.log('Date selected:', selectInfo.startStr);
  }
  
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  bookApartment(apartment: Apartment, startDate: Date, endDate: Date): void {
    const buildingId = this.buildingId ?? 0;

    this.buildingService.getBookings().pipe(
      switchMap(bookings => {
        const validIds = bookings.map(b => b.id).filter(id => !isNaN(id));
        const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
        const nextId = maxId + 1;

        const newBooking: Booking = {
          id: nextId,
          buildingId: buildingId,
          apartmentId: apartment.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };

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

  backToBuildingList() {
    this.router.navigate(['buildings']);
  }

  private loadBuilding(): void {
    this.buildingService.getBuildingById(this.buildingId!).subscribe(
      building => {
        this.apartments = building.apartments;
        this.loadBookings();
      },
      error => {
        this.errorMessage = 'Error fetching apartments';
        console.error('Error fetching apartments', error);
      }
    );
  }

  private loadBookings(): void {
    if(!this.buildingId) return;

    const apartmentIds = this.apartments.map(a => a.id);
    if (apartmentIds.length === 0) return;

    this.buildingService.getBookings().subscribe(
      allBookings => {
        const filteredBookings = allBookings.filter(booking => {
          const matchesBuilding = Number(booking.buildingId) === Number(this.buildingId);
          const matchesApartment = apartmentIds.includes(booking.apartmentId);
        
          console.log('Booking:', booking);
          console.log('Matches Building:', matchesBuilding);
          console.log('Matches Apartment:', matchesApartment);
        
          return matchesBuilding && matchesApartment;
        });

        this.calendarOptions.events = filteredBookings.map(booking => ({
          title: `Apartment ${booking.apartmentId} booked`,
          start: booking.startDate,
          end: booking.endDate
        }));
        console.log('Filtered Bookings:', filteredBookings);
        console.log('Calendar Events:', this.calendarOptions.events);
      },
      error => {
        this.errorMessage = 'Error fetching bookings';
        console.error('Error fetching bookings', error);
      }
    );
  }

  private updateApartmentStatus(apartment: Apartment): void {
    if (!this.buildingId) return;

    this.buildingService.getBuildingById(this.buildingId).pipe(
      switchMap(building => {
        const apartmentIndex = building.apartments.findIndex(a => a.id === apartment.id);
        if (apartmentIndex !== -1) {
          throw new Error(
            `Apartment with ID ${apartment.id} not found in building ${this.buildingId}`
          );
        }

        building.apartments[apartmentIndex].status = apartment.status;
        return this.buildingService.updateBuilding(building);
      })
    ).subscribe({
      next: () => {
        console.log(`Apartment ${apartment.id} status updated to ${apartment.status}`);
      },
      error: error => {
        this.errorMessage = 'Error updating apartment status';
        console.error('Error updating apartment status', error);
      }
    });
  }
}
