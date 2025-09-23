import { TestBed } from '@angular/core/testing';

import { PasswordRushService } from './password-rush.service';

describe('PasswordRushService', () => {
  let service: PasswordRushService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordRushService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
