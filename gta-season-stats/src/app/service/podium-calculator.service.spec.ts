import { TestBed } from '@angular/core/testing';

import { PodiumCalculatorService } from './podium-calculator.service';

describe('StatsCalculatorService', () => {
  let service: PodiumCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PodiumCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
