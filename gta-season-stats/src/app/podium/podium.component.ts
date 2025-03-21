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
  @Input() invertOrder: boolean | undefined;

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
      if (maxPoints === 0) return this.minHeight;

      var normalizedHeight: number;

      if (this.isNegative) {
        normalizedHeight = this.invertOrder
          ? (player.points - minPoints) / (maxPoints - minPoints) // Inverted: Best gets highest
          : (maxPoints - player.points) / (maxPoints - minPoints); // Standard: Best gets lowest
      } else {
        normalizedHeight = this.invertOrder
          ? 1 - (player.points / maxPoints) // Inverted: Best gets lowest
          : player.points / maxPoints; // Standard: Best gets highest
      }
      return Math.max(this.minHeight, normalizedHeight * (this.maxHeight - this.minHeight) + this.minHeight);
    }).filter((height): height is number => height !== undefined);
  }
}
