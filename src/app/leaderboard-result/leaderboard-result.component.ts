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
    if (this.playerName === 'cooooney95' || this.playerName === 'hurling1' || this.playerName === 'BarizztaButzy') {
      this.imagePath = 'assets/special.png';
      this.showImage = true;
    }
  }

  darkenRGBColor(rgb: string, percent: number): string {
    const match = rgb.match(/rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/);
    if (!match) return rgb;

    let [r, g, b] = match.slice(1).map(Number);
    const factor = 1 - percent / 100;

    r = Math.max(0, Math.floor(r * factor));
    g = Math.max(0, Math.floor(g * factor));
    b = Math.max(0, Math.floor(b * factor));

    return `rgb(${r}, ${g}, ${b})`;
  }

  get gradientBackground(): string {
    const base = this.backgroundColour;
    const darker = this.darkenRGBColor(base, 15);
    return `linear-gradient(to left, ${darker}, ${base})`;
  }
}
