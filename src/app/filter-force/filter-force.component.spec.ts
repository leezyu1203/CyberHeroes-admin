import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterForceComponent } from './filter-force.component';

describe('FilterForceComponent', () => {
  let component: FilterForceComponent;
  let fixture: ComponentFixture<FilterForceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterForceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterForceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
