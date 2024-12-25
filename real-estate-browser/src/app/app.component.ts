import { Component } from '@angular/core';
import { BuildingListComponent } from './components/building-list/building-list.component';
import { ApartmentListComponent } from './components/apartment-list/apartment-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BuildingListComponent, ApartmentListComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
