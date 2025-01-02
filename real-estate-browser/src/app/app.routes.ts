import { Routes } from '@angular/router';
import { BuildingListComponent } from './components/building-list/building-list.component';
import { ApartmentDetailsComponent } from './components/apartment-details/apartment-details.component';

export const routes: Routes = [
    { path: '', redirectTo: '/buildings', pathMatch: 'full'},
    { path: 'buildings', component: BuildingListComponent },
    { path: 'building/:id', component: ApartmentDetailsComponent },
    { path: '**', redirectTo: '/buildings'}
];
