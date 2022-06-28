import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemsToolComponent } from './items-tool.component';

describe('ItemsToolComponent', () => {
  let component: ItemsToolComponent;
  let fixture: ComponentFixture<ItemsToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
