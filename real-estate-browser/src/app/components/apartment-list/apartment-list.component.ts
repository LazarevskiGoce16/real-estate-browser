import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BuildingService } from '../../services/building.service';
import { CommonModule } from '@angular/common';
import { Apartment } from '../../models/building.model';
import { Booking } from '../../models/booking.model';
import { Router } from '@angular/router';
import { catchError, map, of, Subscription, switchMap } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './apartment-list.component.html',
  styleUrls: ['./apartment-list.component.css']
})
export class ApartmentListComponent implements OnInit, OnDestroy {
  @Input() 
  buildingId?: number;

  apartments: Apartment[] = [];
  bookings: Booking[] = [];
  errorMessage: string = '';
  viewDate: Date = new Date();

  selectedApartment?: Apartment;
  isModalVisible: boolean = false;
  modalAction: 'book' | 'buy' = 'book';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private buildingService: BuildingService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.buildingId) {
      const buildingSub = this.buildingService.getBuildingById(this.buildingId).subscribe(
        building => {
          this.apartments = building.apartments;
          this.loadBookings();
      },
      error => {
        this.errorMessage = 'Error fetching apartments';
        console.error('Error fetching apartments:', error);
      }
    );
    this.subscriptions.add(buildingSub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openModal(apartment: Apartment, action: 'book' | 'buy'): void {
    this.selectedApartment = apartment;
    this.modalAction = action;
    this.isModalVisible = true;
  }

  confirmAction(): void {
    if (this.selectedApartment) {
      if (this.modalAction === 'book') {
        this.bookApartment(
          this.selectedApartment,
          this.viewDate,
          this.addDays(this.viewDate, 3)
        );
      } else if (this.modalAction === 'buy') {
        this.buyApartment(this.selectedApartment);
      }
      this.isModalVisible = false;
    }
  }

  cancelAction(): void {
    this.isModalVisible = false;
  }

  bookApartment(apartment: Apartment, startDate: Date, endDate: Date): void {
    const buildingId = this.buildingId ?? 0;

    const bookingSub = this.buildingService.getBookings().pipe(
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
    this.subscriptions.add(bookingSub);
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

    const bookingsSub = this.buildingService.getBookings().subscribe(
      allBookings => {
        const filteredBookings = allBookings.filter(booking =>
          booking.buildingId === this.buildingId && apartmentIds.includes(booking.apartmentId)
        );
        console.log(filteredBookings);
      },
      error => console.error('Error fetching bookings', error)
    );
    this.subscriptions.add(bookingsSub);
  }

  private updateApartmentStatus(apartment: Apartment): void {
    if (!this.buildingId) return;

    const updateSub = this.buildingService.getBuildingById(this.buildingId).pipe(
      map(building => {
        const apartmentIndex = building.apartments.findIndex(a => a.id === apartment.id);
        if (apartmentIndex !== -1) {
          building.apartments[apartmentIndex].status = apartment.status;
        }
        return building;
      }),
      switchMap(building => 
        this.buildingService.updateBuilding(building).pipe(
          map(() => ({ success: true })),
          catchError(error => {
            this.errorMessage = `Error updating apartment status to ${apartment.status}`;
            console.error(`Error updating apartment status:`, error);
            return of({ success: false });
          })
        )
      )
    ).subscribe(result => {
      if (result.success) {
        console.log(`Apartment ${apartment.id} status updated to ${apartment.status}`);
      }
    });
    this.subscriptions.add(updateSub);
  }
}