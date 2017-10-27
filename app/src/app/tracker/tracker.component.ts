import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HeartRateService } from '../heart-rate.service';
declare const d3: any;

const d = {
  x0: 250,
  y0: 55,
  yMax: 450,
  range: 30,
  animation: 1000
};

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
  data = new BehaviorSubject(0);

  constructor(private heartRateService: HeartRateService) { }

  ngOnInit() {
    // Generate random data
    setInterval(_ => this.data.next(Math.random() * d.range), 5000);

    const child = d3.select('.child');

    const linearScale = d3.scaleLinear()
      .domain([0, d.range])
      .range([d.y0, d.yMax]);

    this.data.subscribe(point => {
      const y = linearScale(point);
      child.transition()
        .duration(d.animation).attr('y', y);
    });
  }

  calculateDistance(rssi) {
    const txPower = -59; // hard coded power value. Usually ranges between -59 to -65

    if (rssi === 0) {
      return -1.0;
    }

    const ratio = rssi * 1.0 / txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10);
    }

    const distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    return distance;
  }

}
