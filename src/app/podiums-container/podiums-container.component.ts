import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { StatsCalculatorService } from '../service/stats-calculator.service';
import { Observable } from 'rxjs';
import { IndividualResult, PodiumResult } from '../models';
import { PodiumCalculatorService } from '../service/podium-calculator.service';
import { NumberDisplayComponent } from '../number-display/number-display.component';
import { PodiumComponent } from '../podium/podium.component';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";

@Component({
  selector: 'podiums-container',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    NumberDisplayComponent,
    PodiumComponent,
    LoadingSpinnerComponent
],
  templateUrl: './podiums-container.component.html',
  styleUrls: ['./podiums-container.component.scss']
})
export class PodiumsContainerComponent implements OnInit {

  podiums$: Observable<PodiumResult[]> | undefined;
  individualStats$: Observable<IndividualResult[]> | undefined;

  constructor(private podiumCalculator: PodiumCalculatorService, private statsCalculator: StatsCalculatorService) { }

  ngOnInit(): void {
    this.podiums$ = this.podiumCalculator.getAllPodiums();
    this.podiums$.subscribe();
    this.individualStats$ = this.statsCalculator.getAllStats();
    this.individualStats$.subscribe();
  }
}
