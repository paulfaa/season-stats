import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';
import { LoadingSpinnerComponent } from 'src/app/loading-spinner/loading-spinner.component';
import { PodiumResult, IndividualResult } from 'src/app/models';
import { PodiumCalculatorService } from 'src/app/service/podium-calculator.service';
import { StatsCalculatorService } from 'src/app/service/stats-calculator.service';
import { PodiumComponent } from '../podium/podium.component';

@Component({
  selector: 'podiums-container',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    PodiumComponent,
    LoadingSpinnerComponent
],
  templateUrl: './podiums-container.component.html',
  styleUrls: ['./podiums-container.component.scss']
})
export class PodiumsContainerComponent {

  podiums$: Observable<PodiumResult[]> | undefined;
  individualStats$: Observable<IndividualResult[]> | undefined;

  constructor(private podiumCalculator: PodiumCalculatorService, private statsCalculator: StatsCalculatorService) {
    this.podiums$ = this.podiumCalculator.getAllPodiums();
    this.individualStats$ = this.statsCalculator.getAllStats();
  }
}
