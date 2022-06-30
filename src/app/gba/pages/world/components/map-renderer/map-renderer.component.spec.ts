import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapRendererComponent } from './map-renderer.component';

describe('MapRendererComponent', () => {
  let component: MapRendererComponent;
  let fixture: ComponentFixture<MapRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
