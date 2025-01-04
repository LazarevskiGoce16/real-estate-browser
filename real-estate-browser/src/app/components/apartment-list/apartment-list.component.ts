import { Component, Input, OnInit } from '@angular/core';
import { BuildingService } from '../../services/building.service';
import { CommonModule } from '@angular/common';
import { Apartment } from '../../models/building.model';
import { Booking } from '../../models/booking.model';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule],
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

  constructor(
    private buildingService: BuildingService, 
    private router: Router
  ) {}

  ngOnInit(): void {
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
        () => {
            apartment.status = 'booked';
            this.updateApartmentStatus(apartment);
        },
        error => console.error('Error booking apartment', error)
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

  showDetails() {
    this.router.navigate(['building', this.buildingId]);
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

  private loadBookings(): void {
    if (!this.buildingId) return;

    const apartmentIds = this.apartments.map(a => a.id);
    if (apartmentIds.length === 0) return;

    this.buildingService.getBookings().subscribe(
        allBookings => {
            const filteredBookings = allBookings.filter(booking =>
                booking.buildingId === this.buildingId && apartmentIds.includes(booking.apartmentId)
            );
            console.log(filteredBookings);
        },
        error => console.error('Error fetching bookings', error)
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
}