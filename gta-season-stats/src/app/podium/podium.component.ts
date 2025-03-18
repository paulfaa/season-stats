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
  @Input() isNegative: boolean | undefined;

  maxHeight = 140;
  minHeight = 80;
  podiumHeights: number[] = [];

  constructor() { }

  ngOnInit(): void {
    this.computePodiumHeights();
    const podiumItems = document.querySelectorAll('.podium-item');
    podiumItems.forEach(item => {
      const randomDelay = Math.random() * 2; // Random delay between 0s and 2s
      (item as HTMLElement).style.setProperty('--random-delay', randomDelay.toString());
    });
  }

  get podiumType(): 'points' | 'percentage' | 'ordinal' | 'default' {
    const title = this.podiumTitle.toLowerCase();
    if (title.includes('points') || title.includes('margin')) return 'points';
    if (title.includes('position')) return 'ordinal';
    if (title.includes('ratio') || title.includes('percentage') || title.includes('dedicated')) return 'percentage';
    return 'default';
  }

  private computePodiumHeights(): void {
    const pointsArray = this.podiumData.map(player => player.points);
    const maxPoints = Math.max(...pointsArray);
    const minPoints = Math.min(...pointsArray);

    this.podiumHeights = this.podiumData.map(player => {
      if (!this.isNegative) {
        // Normal case (higher is better)
        return maxPoints === 0 ? this.minHeight :
          Math.max(this.minHeight, (player.points / maxPoints) * this.maxHeight);
      } else {
        // Inverted case (lower is better)
        return minPoints === maxPoints ? this.minHeight :
          Math.max(this.minHeight, ((maxPoints - player.points) / (maxPoints - minPoints)) * (this.maxHeight - this.minHeight) + this.minHeight);
      }
    });
  }
}
