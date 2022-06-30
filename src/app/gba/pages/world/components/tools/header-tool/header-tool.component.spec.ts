import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderToolComponent } from './header-tool.component';

describe('HeaderToolComponent', () => {
  let component: HeaderToolComponent;
  let fixture: ComponentFixture<HeaderToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
