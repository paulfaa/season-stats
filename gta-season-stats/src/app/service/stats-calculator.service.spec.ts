import { TestBed } from '@angular/core/testing';

import { StatsCalculatorService } from './stats-calculator.service';

describe('StatsCalculatorService', () => {
  let service: StatsCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
