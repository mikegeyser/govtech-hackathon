import { Component, OnInit } from '@angular/core';
import { HeartRateService } from '../heart-rate.service';

@Component({
  selector: 'app-heart-rate',
  templateUrl: './heart-rate.component.html',
  styleUrls: ['./heart-rate.component.css']
})
export class HeartRateComponent implements OnInit {

  constructor(private heartRateService: HeartRateService) { }

  ngOnInit() {
  }

  connect() {
    this.heartRateService.connect();
  }
}
