import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
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
  public showImage: boolean = false;
  public imagePath: string = 'assets/special.png';

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.backgroundColour = Utils.getCorrespondingColour(this.playerName);
    if (this.playerName === 'jackw2610') {
      this.textColour = 'white';
    }
    if (this.points == 0) {
      this.opacity = 0.3;
    }
    const parentElement = this.el.nativeElement.parentElement;
    if (parentElement && parentElement.classList.contains('leaderboard')) {
      if(this.playerName === 'cooooney95' || this.playerName === 'hurling1'){
        this.imagePath = 'assets/special.png';
        this.showImage = true;
      }
      /* if(this.playerName === 'iiCiaran' || this.playerName === 'BarizztaButzy'){
        this.imagePath = 'assets/brother.png';
        this.showImage = true
      } */
    }
  }
}
