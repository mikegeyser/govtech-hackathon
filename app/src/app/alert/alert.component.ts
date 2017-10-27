import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../device.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  message = '';

  constructor(public deviceService: DeviceService) { }

  ngOnInit() {
  }

}
