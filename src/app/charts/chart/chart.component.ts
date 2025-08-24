import { Component, Input, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartResult } from '../../models';
import { ChartOptions, ChartType } from 'chart.js';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgChartsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  public chart: any;
  lineChartType: ChartType = 'line';
  filteredChartData: any;

  @Input() chartData: ChartResult | undefined;

  constructor() { }

  ngOnInit(): void {
    this.onRangeChange('month');
  }

  onRangeChange(range: string): void {
    if (!this.chartData) return;

    const labels: string[] = this.chartData.chartData.labels as string[];
    const datasets = this.chartData.chartData.datasets;

    const today = new Date();
    const cutoff = this.getCutoffDate(today, range);

    const filteredIndices = labels
      .map((label, index) => ({ index: index, date: this.parseLabelToDate(label) }))
      .filter(item => item.date >= cutoff || range === 'all')
      .map(item => item.index);

    this.filteredChartData = {
      labels: filteredIndices.map(i => labels[i]),
      datasets: datasets.map(ds => ({
        ...ds,
        data: filteredIndices.map(i => ds.data[i])
      }))
    };
  }

  private getCutoffDate(today: Date, range: string): Date {
    const d = new Date(today);
    switch (range) {
      case 'week':
        d.setDate(d.getDate() - 7);
        break;
      case 'month':
        d.setMonth(d.getMonth() - 1);
        break;
      case '3m':
        d.setMonth(d.getMonth() - 3);
        break;
      case '6m':
        d.setMonth(d.getMonth() - 6);
        break;
      case 'all':
      default:
        d.setFullYear(1970);
        break;
    }
    return d;
  }

  private parseLabelToDate(label: string): Date {
    const [day, month] = label.split('-').map(Number);
    const year = new Date().getFullYear();
    return new Date(year, month - 1, day);
  }
}
