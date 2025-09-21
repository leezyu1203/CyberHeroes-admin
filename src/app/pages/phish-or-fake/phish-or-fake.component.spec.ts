import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhishOrFakeComponent } from './phish-or-fake.component';

describe('PhishOrFakeComponent', () => {
  let component: PhishOrFakeComponent;
  let fixture: ComponentFixture<PhishOrFakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhishOrFakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhishOrFakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
