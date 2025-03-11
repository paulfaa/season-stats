import { Component, OnInit } from '@angular/core';
import { StatsCalculatorService } from '../service/stats-calculator.service';
import { Observable } from 'rxjs';
import { IndividualResult, PodiumResult } from '../models';

@Component({
  selector: 'stats-container',
  templateUrl: './stats-container.component.html',
  styleUrls: ['./stats-container.component.scss']
})
export class StatsContainerComponent implements OnInit {

  podiumStats$: Observable<PodiumResult[]> | undefined;
  individualStats$: Observable<IndividualResult[]> | undefined;

  constructor(private statsCalculator: StatsCalculatorService) { }

  ngOnInit(): void {
    this.podiumStats$ = this.statsCalculator.getAllPodiumStats();
    this.podiumStats$.subscribe();
    this.individualStats$ = this.statsCalculator.getAllIndividualStats();
    this.individualStats$.subscribe();
  }
}
