import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterMinitoolComponent } from './encounter-minitool.component';

describe('EncounterMinitoolComponent', () => {
  let component: EncounterMinitoolComponent;
  let fixture: ComponentFixture<EncounterMinitoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterMinitoolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterMinitoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
