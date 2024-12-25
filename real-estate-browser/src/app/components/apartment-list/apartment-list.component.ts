import { Component, Input, OnInit } from '@angular/core';
import { BuildingService } from '../../services/building.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Apartment } from '../../models/building.model';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apartment-list.component.html',
  styleUrls: ['./apartment-list.component.css']
})
export class ApartmentListComponent implements OnInit {
  @Input() buildingId?: number;
  apartments: Apartment[] = [];
  errorMessage: string = '';

  constructor(private buildingService: BuildingService, private http: HttpClient) { }

  ngOnInit(): void {
    if (this.buildingId) {
      this.buildingService.getBuilding(this.buildingId).subscribe(
        building => {
          this.apartments = building.apartments;
      },
      error => {
        this.errorMessage = 'Error fetching apartments';
        console.error('Error fetching apartments:', error);
      }
    )};
  }

  bookApartment(apartment: Apartment): void {
    this.updateApartmentStatus(apartment, 'booked');
    // alert('Apartment ' + apartmentId + ' booked.');
  }

  buyApartment(apartment: Apartment): void {
    this.updateApartmentStatus(apartment, 'sold');
    // alert('Apartment ' + apartmentId + ' bought.');
  }

  private updateApartmentStatus(apartment: Apartment, status: string): void {
    if (!this.buildingId) return;

    const updatedApartment = { ...apartment, status };
    this.buildingService.getBuilding(this.buildingId).subscribe(
      building => {
        const apartmentIndex = building.apartments.findIndex(a => a.id === apartment.id);
        if (apartmentIndex !== -1) {
          building.apartments[apartmentIndex].status = status;
          this.buildingService.updateBuilding(building).subscribe(
            updatedBuilding => {
              this.apartments = updatedBuilding.apartments;
            },
            error => {
              this.errorMessage = `Error updating apartment status to ${status}`;
              console.error(`Error updating apartment status to ${status}:`, error);
            }
          );
        }
      },
      error => {
        this.errorMessage = `Error fetching building with ID ${this.buildingId}`;
        console.error(`Error fetching building with ID ${this.buildingId}:`, error);
      }
    )
  }
}