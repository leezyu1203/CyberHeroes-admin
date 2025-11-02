import { TestBed } from '@angular/core/testing';

import { RevisionKeyPointsService } from './revision-key-points.service';

describe('RevisionKeyPointsService', () => {
  let service: RevisionKeyPointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevisionKeyPointsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
