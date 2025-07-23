import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { ChartsService } from '../../service/charts.service';
import { ChartResult } from '../../models';
import { ChartComponent } from '../chart/chart.component';
import { LoadingSpinnerComponent } from "../../loading-spinner/loading-spinner.component";
import { combineLatest } from 'rxjs';

@Component({
  selector: 'chart-container',
  standalone: true,
  imports: [CommonModule, ChartComponent, LoadingSpinnerComponent],
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnInit {

  charts$: Observable<ChartResult[]> | undefined;

  constructor(private chartsService: ChartsService) { }

   ngOnInit(): void {
    this.charts$ = combineLatest([
      this.chartsService.getAllCharts(),
      this.chartsService.getChampionshipPointsChart()
    ]).pipe(
      map(([charts, championshipChart]) => [...charts, championshipChart])
    );
  }
}
