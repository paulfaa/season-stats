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

  displayedColumns = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
  f1PointsRow = [{
    '1st': 25,
    '2nd': 18,
    '3rd': 15,
    '4th': 12,
    '5th': 10,
    '6th': 8,
    '7th': 6,
    '8th': 4,
    '9th': 2,
    '10th': 1,
  }];

  ngOnInit(): void {
    this.results$ = this.leaderboardService.getRaceBreakdown();
    this.leaderboard$ = this.leaderboardService.getOverallLeaderboard();
    this.leaderboard$?.subscribe(data => {
      console.log('Leaderboard data:', data);
    });
  }
}
