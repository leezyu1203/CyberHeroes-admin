import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRushComponent } from './password-rush.component';

describe('PasswordRushComponent', () => {
  let component: PasswordRushComponent;
  let fixture: ComponentFixture<PasswordRushComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRushComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordRushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
