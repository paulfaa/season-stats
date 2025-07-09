import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '../service/leaderboard.service';
import { PlayerResult, RaceResults } from '../models';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LeaderboardInfoComponent } from '../leaderboard-info/leaderboard-info.component';

@Component({
  selector: 'leaderboard-container',
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
