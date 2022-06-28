import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldComponent } from './world.component';

describe('WorldComponent', () => {
  let component: WorldComponent;
  let fixture: ComponentFixture<WorldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
