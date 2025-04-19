import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatsCalculatorService } from '../service/stats-calculator.service';
import { Chart, ChartData } from 'chart.js';

@Component({
  selector: 'chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnInit {

  charts$: Observable<ChartData[]> | undefined;

  constructor(private statsCalculator: StatsCalculatorService) { }

  ngOnInit(): void {
    this.charts$ = this.statsCalculator.chartData$;
  }
}
