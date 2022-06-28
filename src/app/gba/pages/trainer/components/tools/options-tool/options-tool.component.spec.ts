import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsToolComponent } from './options-tool.component';

describe('OptionsToolComponent', () => {
  let component: OptionsToolComponent;
  let fixture: ComponentFixture<OptionsToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionsToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
