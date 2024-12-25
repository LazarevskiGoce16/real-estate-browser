import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ApartmentListComponent } from './components/apartment-list/apartment-list.component';
import { BuildingListComponent } from './components/building-list/building-list.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    AppComponent,
    BuildingListComponent,
    ApartmentListComponent, 
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
