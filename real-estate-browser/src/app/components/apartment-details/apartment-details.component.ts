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

  backToBuildingList() {
    this.router.navigate(['buildings']);
  }

  getApartmentStatusClass(apartment: Apartment): string {
    switch(apartment.status) {
      case 'available':
        return 'available';
      case 'booked':
        return 'booked';
      case 'sold':
        return 'sold';
      default:
        return '';
    }
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
}
