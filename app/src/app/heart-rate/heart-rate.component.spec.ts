import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartRateComponent } from './heart-rate.component';

describe('HeartRateComponent', () => {
  let component: HeartRateComponent;
  let fixture: ComponentFixture<HeartRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeartRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeartRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
