import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattlefieldCardComponent } from './battlefield-card.component';

describe('BattlefieldCardComponent', () => {
  let component: BattlefieldCardComponent;
  let fixture: ComponentFixture<BattlefieldCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BattlefieldCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BattlefieldCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
