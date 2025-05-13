import { Component, OnInit } from '@angular/core';
import { RaceResult } from '../models';
import { Observable } from 'rxjs';
import { LeaderboardService } from '../service/leaderboard.service';

@Component({
  selector: 'app-race-result-container',
  templateUrl: './race-result-container.component.html',
  styleUrls: ['./race-result-container.component.scss']
})
export class RaceResultContainerComponent implements OnInit {

  raceResults$: Observable<[RaceResult[]]> | undefined;

  constructor(private leaderboardService: LeaderboardService) { }

  ngOnInit(): void {
    //this.raceResults$ = this.leaderboardService.getRaceBreakdown;
  }
}
