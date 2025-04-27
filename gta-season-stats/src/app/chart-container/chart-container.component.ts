import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChartsService } from '../service/charts.service';
import { ChartResult } from '../models';

@Component({
  selector: 'chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnInit {

  charts$: Observable<ChartResult[]> | undefined;

  constructor(private chartsService: ChartsService) { }

  ngOnInit(): void {
    this.charts$ = this.chartsService.getAllCharts();
  }
}
