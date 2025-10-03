import { TestBed } from '@angular/core/testing';

import { FilterForceService } from './filter-force.service';

describe('FilterForceService', () => {
  let service: FilterForceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterForceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
