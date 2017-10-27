import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TrackerComponent } from './tracker/tracker.component';
import { HeaderComponent } from './header/header.component';

import { HeartRateService } from './heart-rate.service';
import { HeartRateComponent } from './heart-rate/heart-rate.component';
import { BatteryComponent } from './battery/battery.component';

@NgModule({
  declarations: [
    AppComponent,
    TrackerComponent,
    HeaderComponent,
    HeartRateComponent,
    BatteryComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [HeartRateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
