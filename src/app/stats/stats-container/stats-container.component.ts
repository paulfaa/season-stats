import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { IndividualResult, TableData } from 'src/app/models';
import { StatsCalculatorService } from 'src/app/service/stats-calculator.service';
import { NumberDisplayComponent } from "../number-display/number-display.component";
import { LoadingSpinnerComponent } from "src/app/loading-spinner/loading-spinner.component";
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-stats-container',
  standalone: true,
  imports: [CommonModule, NumberDisplayComponent, LoadingSpinnerComponent, MatTableModule],
  templateUrl: './stats-container.component.html',
  styleUrls: ['./stats-container.component.scss']
})
export class StatsContainerComponent {

  individualStats$: Observable<IndividualResult[]>;
  tableData$: Observable<TableData[]>;

  constructor(private statsCalculator: StatsCalculatorService) {
    this.individualStats$ = this.statsCalculator.getAllStats();
    this.tableData$ = this.statsCalculator.getAllTables().pipe(
      map(tables =>
        tables.map(table => ({
          ...table,
          data: table.data.map(row => ({
            ...row,
            scoreColor: this.calculateScoreColor(row.points)
          }))
        }))
      )
    ); //todo: create new interface for this
  }

  private calculateScoreColor(score: number): string {
    const clamped = Math.max(0, Math.min(100, score));
    const lightness = 100 - clamped * 0.5;
    return `hsl(0, 100%, ${lightness}%)`;
  }
}
