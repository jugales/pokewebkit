import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerCardComponent } from './trainer-card.component';

describe('TrainerCardComponent', () => {
  let component: TrainerCardComponent;
  let fixture: ComponentFixture<TrainerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainerCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
