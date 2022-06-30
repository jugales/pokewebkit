import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementMinitoolComponent } from './movement-minitool.component';

describe('MovementMinitoolComponent', () => {
  let component: MovementMinitoolComponent;
  let fixture: ComponentFixture<MovementMinitoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovementMinitoolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementMinitoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
