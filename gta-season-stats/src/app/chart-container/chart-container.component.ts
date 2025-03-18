import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StatsCalculatorService } from '../service/stats-calculator.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnInit {

  charts$: Observable<Chart[]> | undefined;

  constructor(private statsCalculator: StatsCalculatorService) { }

  ngOnInit(): void {
    this.charts$ = this.statsCalculator.getAllChartData();
  }

}
