import { TestBed } from '@angular/core/testing';

import { PhishOrFakeService } from './phish-or-fake.service';

describe('PhishOrFakeService', () => {
  let service: PhishOrFakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhishOrFakeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
