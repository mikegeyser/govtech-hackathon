import { Component, OnInit } from '@angular/core';
import { HeartRateService } from '../heart-rate.service';
import { DeviceService } from '../device.service';

declare let d3: any;

@Component({
  selector: 'app-heart-rate',
  templateUrl: './heart-rate.component.html',
  styleUrls: ['./heart-rate.component.css']
})
export class HeartRateComponent implements OnInit {

  constructor(private deviceService: DeviceService, private heartRateService: HeartRateService) { }

  ngOnInit() {
    const graph = d3.select('#graph1')
      .append('svg:svg')
      .attr('width', '100%')
      .attr('height', '100%');

    const x = d3.scaleLinear()
      .domain([0, 48])
      .range([-5, 300]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 30]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y((d) => y(-1 * d))
      .curve(d3.curveBasis);

    const data = [60, 60, 60, 60];

    graph.append('g').attr('transform', 'translate(0, 50)').append('svg:path')
      .attr('d', line(data));

    this.deviceService.heartrate.subscribe(heartRate => {
      data.push(heartRate);

      if (data.length > 30) {
        data.shift();
      }

      graph.selectAll('path')
        .data([data])
        .attr('transform', 'translate(' + x(1) + ')')
        .attr('d', line)
        .transition()
        .ease(d3.easeLinear)
        .attr('transform', 'translate(' + x(0) + ')');
    });
  }

  connect() {
    this.heartRateService.connect();
  }
}
