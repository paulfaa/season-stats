import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LeaderboardService } from '../service/leaderboard.service';
import { PlayerResult, RaceResults } from '../models';
import { Observable } from 'rxjs';
import { LeaderboardInfoComponent } from '../leaderboard-info/leaderboard-info.component';
import { LeaderboardResultComponent } from '../leaderboard-result/leaderboard-result.component';
import { PlayerResultsContainerComponent } from '../player-results-container/player-results-container.component';

@Component({
  selector: 'leaderboard-container',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    LeaderboardResultComponent,
    PlayerResultsContainerComponent
  ],
  templateUrl: './leaderboard-container.component.html',
  styleUrls: ['./leaderboard-container.component.scss']
})
export class LeaderboardContainerComponent implements OnInit {

  public results$: Observable<RaceResults> | undefined;
  public leaderboard$?: Observable<PlayerResult[]>;

  constructor(private leaderboardService: LeaderboardService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.results$ = this.leaderboardService.getRaceBreakdown();
    this.leaderboard$ = this.leaderboardService.getOverallLeaderboard();
  }

  public openDialog(): void {
    this.dialog.open(LeaderboardInfoComponent, {
      width: '80%'
    });
  }
}
