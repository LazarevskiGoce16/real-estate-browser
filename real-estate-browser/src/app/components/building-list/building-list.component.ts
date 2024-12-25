import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BuildingService } from '../../services/building.service';
import { Building } from '../../models/building.model';
import { Subscription } from 'rxjs';
import { ApartmentListComponent } from '../apartment-list/apartment-list.component';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [CommonModule, ApartmentListComponent],
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.css']
})
export class BuildingListComponent implements OnInit, OnDestroy {
  buildings: Building[] = [];
  selectedBuildingId?: number;
  private subscription: Subscription | null = null;
  errorMessage: string = '';

  constructor(private buildingService: BuildingService) { }

  ngOnInit(): void {
    this.subscription = this.buildingService.getBuildings().subscribe(
      data => {
        this.buildings = data;
      },
      error => {
        this.errorMessage = 'Error fetching buildings';
        console.error('Error fetching buildings:', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onBuildingSelect(buildingId: number): void {
    if (this.selectedBuildingId === buildingId) {
      this.selectedBuildingId = undefined;
    } else {
      this.selectedBuildingId = buildingId;
    }
    console.log('Building selected:', buildingId);
  }

  onApartmentSelect(apartmentId: number): void {
    console.log('Apartment selected:', apartmentId);
  }
}