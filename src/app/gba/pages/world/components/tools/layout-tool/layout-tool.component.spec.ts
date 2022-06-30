import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutToolComponent } from './layout-tool.component';

describe('LayoutToolComponent', () => {
  let component: LayoutToolComponent;
  let fixture: ComponentFixture<LayoutToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
