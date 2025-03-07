import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-podium',
  templateUrl: './podium.component.html',
  styleUrls: ['./podium.component.scss']
})
export class PodiumComponent implements OnInit {
  @Input() podiumData: { username: string; points: number }[] = [];
  @Input() podiumTitle: string = "";
  /* podiumData = [
  { username: 'Alice', points: 200 },
  { username: 'Bob', points: 150 },
  { username: 'Charlie', points: 120 }
  ] */

  constructor() { }

  ngOnInit(): void {
  }

}
