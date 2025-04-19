import { Component, Input, OnInit } from '@angular/core';
import { ChartResult } from '../models';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  public chart: any;

  @Input() chartData: ChartResult | undefined;

  constructor() { }

  ngOnInit(): void { }

  lineChartType: ChartType = 'line';
}
