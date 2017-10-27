import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HeartRateService } from './heart-rate.service';
import { DeviceService } from './device.service';

import { AppComponent } from './app.component';
import { TrackerComponent } from './tracker/tracker.component';
import { HeaderComponent } from './header/header.component';

import { HeartRateComponent } from './heart-rate/heart-rate.component';
import { BatteryComponent } from './battery/battery.component';
import { AlertComponent } from './alert/alert.component';

@NgModule({
  declarations: [
    AppComponent,
    TrackerComponent,
    HeaderComponent,
    HeartRateComponent,
    BatteryComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [HeartRateService, DeviceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
