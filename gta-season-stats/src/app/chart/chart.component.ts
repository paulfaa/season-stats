import { Component, Input, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  public chart: any;

  @Input() chartData: ChartData | undefined;

  constructor() { }

  ngOnInit(): void { }

  lineChartType: ChartType = 'line';

  lineChartOptions: ChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        radius: 0
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
    }
  };
}
