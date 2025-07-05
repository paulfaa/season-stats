import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { Utils } from '../util/utils';

@Component({
  selector: 'leaderboard-result',
  templateUrl: './leaderboard-result.component.html',
  styleUrls: ['./leaderboard-result.component.scss']
})
export class LeaderboardResultComponent implements OnInit {

  @Input() playerName: string = '';
  @Input() points: number = 0;
  @Input() position: number = 0;

  public backgroundColour: string = '';
  public textColour: string = 'black';
  public showImage: boolean = false;
  public imagePath: string = 'assets/special.png';

  ngOnInit(): void {
    this.backgroundColour = Utils.getCorrespondingColour(this.playerName);
    if (this.playerName === 'jackw2610') {
      this.textColour = 'white';
    }
    if (this.playerName === 'cooooney95' || this.playerName === 'hurling1') {
        this.imagePath = 'assets/special.png';
        this.showImage = true;
    }
  }
}
