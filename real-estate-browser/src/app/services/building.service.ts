import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Building } from '../models/building.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(`${this.apiUrl}/buildings`);
  }

  getBuilding(buildingId: number): Observable<Building> {
    return this.http.get<Building>(`${this.apiUrl}/buildings/${buildingId}`);
  }

  updateBuilding(building: Building): Observable<Building> {
    return this.http.put<Building>(`${this.apiUrl}/buildings/${building.id}`, building);
  }
}
