import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionKeyPointsComponent } from './revision-key-points.component';

describe('RevisionKeyPointsComponent', () => {
  let component: RevisionKeyPointsComponent;
  let fixture: ComponentFixture<RevisionKeyPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionKeyPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionKeyPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
