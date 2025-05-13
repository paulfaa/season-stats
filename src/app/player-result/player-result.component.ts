import { Component, Input, OnInit } from '@angular/core';
import { Utils } from '../util/utils';

@Component({
  selector: 'player-result',
  templateUrl: './player-result.component.html',
  styleUrls: ['./player-result.component.scss']
})
export class PlayerResultComponent implements OnInit {

  @Input() playerName: string = '';
  @Input() points: number = 0;
  public backgroundColour: string = '';
  public textColour: string = 'black';
  public opacity: number = 1;

  constructor() { }

  ngOnInit(): void {
    this.backgroundColour = Utils.getCorrespondingColour(this.playerName);
    if (this.playerName === 'jackw2610') {
      this.textColour = 'white';
    }
    if (this.points == 0) {
      this.opacity = 0.3;
    }
  }
}
