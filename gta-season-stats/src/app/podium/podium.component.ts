import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-podium',
  templateUrl: './podium.component.html',
  styleUrls: ['./podium.component.scss']
})
export class PodiumComponent implements OnInit {
  @Input() podiumData: { username: string; points: number }[] = [];
  @Input() podiumTitle: string = "";
  @Input() startPosition: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

}
