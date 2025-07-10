import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ChartsService } from '../service/charts.service';
import { ChartResult } from '../models';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'chart-container',
  standalone: true,
  imports: [CommonModule, ChartComponent],
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
