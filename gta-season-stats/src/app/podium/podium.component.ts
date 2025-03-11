import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../models';

@Component({
  selector: 'app-podium',
  templateUrl: './podium.component.html',
  styleUrls: ['./podium.component.scss']
})
export class PodiumComponent implements OnInit {
  @Input() podiumData: Player[] = [];
  @Input() podiumTitle: string = "";
  @Input() startPosition: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  get podiumType(): 'points' | 'percentage'| 'ordinal' | 'default' {
    const title = this.podiumTitle.toLowerCase();
    if (title.includes('points') || title.includes('margin')) return 'points';
    if (title.includes('position')) return 'ordinal';
    if (title.includes('ratio') || title.includes('percentage') || title.includes('dedicated')) return 'percentage';
    return 'default';
  }
}
