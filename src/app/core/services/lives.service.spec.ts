import { TestBed } from '@angular/core/testing';

import { LivesService } from './lives.service';

describe('LivesService', () => {
  let service: LivesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LivesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
