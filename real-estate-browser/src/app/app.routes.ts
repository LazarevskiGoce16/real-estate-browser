import { Routes } from '@angular/router';
import { ApartmentListComponent } from './components/apartment-list/apartment-list.component';
import { BuildingListComponent } from './components/building-list/building-list.component';

export const routes: Routes = [
    { path: '', redirectTo: '/apartments', pathMatch: 'full'},
    { path: 'apartments', component: ApartmentListComponent },
    { path: 'buildings', component: BuildingListComponent },
    { path: '**', redirectTo: '/apartments'}
];
