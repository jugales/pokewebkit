import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityMinitoolComponent } from './entity-minitool.component';

describe('EntityMinitoolComponent', () => {
  let component: EntityMinitoolComponent;
  let fixture: ComponentFixture<EntityMinitoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityMinitoolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityMinitoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
