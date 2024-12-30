import { Routes } from '@angular/router';
import { ApartmentListComponent } from './components/apartment-list/apartment-list.component';
import { BuildingListComponent } from './components/building-list/building-list.component';

export const routes: Routes = [
    { path: '', redirectTo: '/buildings', pathMatch: 'full'},
    { path: 'buildings', component: BuildingListComponent },
    { path: 'building/:id', component: ApartmentListComponent },
    { path: '**', redirectTo: '/buildings'}
];
