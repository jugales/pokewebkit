import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCardComponent } from './map-card.component';

describe('MapCardComponent', () => {
  let component: MapCardComponent;
  let fixture: ComponentFixture<MapCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
