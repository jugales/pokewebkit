import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocksetMinitoolComponent } from './blockset-minitool.component';

describe('BlocksetMinitoolComponent', () => {
  let component: BlocksetMinitoolComponent;
  let fixture: ComponentFixture<BlocksetMinitoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlocksetMinitoolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocksetMinitoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
