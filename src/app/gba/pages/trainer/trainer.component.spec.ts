import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerComponent } from './trainer.component';

describe('TrainerComponent', () => {
  let component: TrainerComponent;
  let fixture: ComponentFixture<TrainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
