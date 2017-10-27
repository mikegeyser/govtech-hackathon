import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/debounceTime';

declare const io: any;
@Injectable()
export class DeviceService {
  distance = new BehaviorSubject(0);
  heartrate = new BehaviorSubject(0);
  connected = new BehaviorSubject(true);

  distance_warning = new BehaviorSubject(null);
  heartrate_warning = new BehaviorSubject(null);
  connected_warning = new BehaviorSubject(null);

  warning = Observable.merge(this.distance_warning, this.heartrate_warning, this.connected_warning).debounceTime(1000);

  constructor() {
    const socket = io('http://172.20.10.8:4201/');

    // Test data
    // setInterval(_ => this.distance.next(Math.random() * 50), 5000);
    // setInterval(_ => this.heartrate.next(60 + Math.random() * 200), 5000);

    socket.on('distance', (d) => this.distance.next(d));
    socket.on('heartrate', (d) => this.heartrate.next(d));
    socket.on('connected', (d) => this.connected.next(d));

    this.distance.subscribe(distance => {
      console.log(`Distance: ${distance}`);
      this.distance_warning.next((distance > 30) ? `Your child is more than 30 metres away from you.` : null);
    });

    this.heartrate.subscribe(heartrate => {
      console.log(`Heartrate: ${heartrate}`);

      this.heartrate_warning.next((heartrate > 200) ? `Your child is afraid of something.` : null);
    });

    this.connected.subscribe(connected => {
      console.log(`Connected: ${connected}`);

      this.connected_warning.next((!connected) ? `Your rescue bug isn't connected!` : null);
    });

    this.warning.subscribe(x => console.log(`Warning: ${x}`));
  }
}
