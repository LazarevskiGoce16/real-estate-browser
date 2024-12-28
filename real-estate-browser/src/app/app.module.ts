import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BuildingService } from './services/building.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

import { AppComponent } from './app.component';
import { ApartmentListComponent } from './components/apartment-list/apartment-list.component';
import { BuildingListComponent } from './components/building-list/building-list.component';

@NgModule({
  declarations: [
    AppComponent,
    BuildingListComponent,
    ApartmentListComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [BuildingService],
  bootstrap: [AppComponent],
})
export class AppModule { }
