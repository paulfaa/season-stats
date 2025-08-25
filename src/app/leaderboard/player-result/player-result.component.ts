import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { Utils } from '../../util/utils';
import { ShortNamePipe } from '../../pipes/name-format.pipe';
import { PlayerPoints } from 'src/app/models';

@Component({
  selector: 'player-result',
  standalone: true,
  imports: [ShortNamePipe],
  templateUrl: './player-result.component.html',
  styleUrls: ['./player-result.component.scss']
})
export class PlayerResultComponent implements OnInit {

  @Input() playerPoints!: PlayerPoints;

  public backgroundColour: string = '';
  public textColour: string = 'black';
  public opacity: number = 1;

  ngOnInit(): void {
    this.backgroundColour = Utils.getCorrespondingColour(this.playerPoints.playerName);
    if (this.playerPoints.playerName === 'jackw2610' || this.playerPoints.playerName === 'cwolin') {
      this.textColour = 'white';
    }
    if (this.playerPoints.championshipPoints == 0) {
      this.opacity = 0.3;
    }
  }
}
