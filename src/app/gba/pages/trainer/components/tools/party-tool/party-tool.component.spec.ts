import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyToolComponent } from './party-tool.component';

describe('PartyToolComponent', () => {
  let component: PartyToolComponent;
  let fixture: ComponentFixture<PartyToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartyToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
