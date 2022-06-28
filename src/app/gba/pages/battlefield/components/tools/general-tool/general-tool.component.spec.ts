import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralToolComponent } from './general-tool.component';

describe('GeneralToolComponent', () => {
  let component: GeneralToolComponent;
  let fixture: ComponentFixture<GeneralToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
