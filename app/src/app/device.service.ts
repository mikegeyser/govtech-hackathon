import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

declare const io: any;
@Injectable()
export class DeviceService {
  distance = new BehaviorSubject(0);
  heartrate = new BehaviorSubject(0);

  distance_warning = new BehaviorSubject(null);
  heartrate_warning = new BehaviorSubject(null);

  constructor() {
    const socket = io('http://172.20.10.8:4201/');

    // Test data
    // setInterval(_ => this.distance.next(Math.random() * 30), 5000);
    setInterval(_ => this.heartrate.next(60 + Math.random() * 30), 5000);

    socket.on('distance', (d) => this.distance.next(d));
    socket.on('heart-rate', (d) => this.distance.next(d));

    this.distance.subscribe(distance => {
      this.distance_warning.next((distance > 30) ? `Your child is more than 30 metres away from you.` : null);
    });

    this.heartrate.subscribe(heartrate => {
      this.heartrate_warning.next((heartrate > 200) ? `Your child is afraid of something.` : null);
    });
  }
}
