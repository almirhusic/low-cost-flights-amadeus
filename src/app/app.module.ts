import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgDatepickerModule } from 'ng2-datepicker';
import { DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { LowCostFlightComponent } from './low-cost-flight/low-cost-flight.component';
import { InspirationSearchComponent } from './inspiration-search/inspiration-search.component';
import { CheapestDateComponent } from './cheapest-date/cheapest-date.component';

const appRoutes: Routes = [
  { path: '', component: LowCostFlightComponent, pathMatch: 'full' },
  { path: 'cheapest-date', component: CheapestDateComponent, pathMatch: 'full' },
  { path: 'inspiration-search', component: InspirationSearchComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    LowCostFlightComponent,
    InspirationSearchComponent,
    CheapestDateComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgDatepickerModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    DatePipe
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
