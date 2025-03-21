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

  lineChartData: ChartData<'line'> = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
    datasets: [
      {
        label: 'Sales 2023',
        data: [50, 100, 150, 200, 200, 300, 350, 350, 450, 500],
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.3)',
        fill: true
      },
      {
        label: 'Sales 2024',
        data: [80, 120, 180, 180, 180, 180, 400, 450, 500, 550],
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.3)',
        fill: true
      }
    ]
  };

}
