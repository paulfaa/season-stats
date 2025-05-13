import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '../service/leaderboard.service';
import { PlayerResult, RaceResults } from '../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'leaderboard-container',
  templateUrl: './leaderboard-container.component.html',
  styleUrls: ['./leaderboard-container.component.scss']
})
export class LeaderboardContainerComponent implements OnInit {

  public results$: Observable<RaceResults> | undefined;
  public leaderboard$?: Observable<PlayerResult[]>;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.results$ = this.leaderboardService.getRaceBreakdown();
    this.leaderboard$ = this.leaderboardService.getOverallLeaderboard();
    this.leaderboard$?.subscribe(data => {
      console.log('Leaderboard data:', data);
    });
  }
}
