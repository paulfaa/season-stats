import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leaderboard-info',
  templateUrl: './leaderboard-info.component.html',
  styleUrls: ['./leaderboard-info.component.scss']
})
export class LeaderboardInfoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

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

}
