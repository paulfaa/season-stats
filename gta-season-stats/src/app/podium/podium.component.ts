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
  @Input() subtitle?: string;
  @Input() startPosition: number = 0;
  @Input() isNegative: boolean | undefined;
  @Input() invertOrder: boolean | undefined;

  private maxHeight = 140;
  private minHeight = 80;
  private podiumHeights: number[] = [];
  podiumPositions: { player: Player, rank: number, height: number }[] = [];

  constructor() { }

  ngOnInit(): void {
    this.computePodiumPositions();
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

  private computePodiumPositions(): void {
    this.computePodiumHeights();
    this.computeRanks();
  }

  private computePodiumHeights(): void {
    const pointsArray = this.podiumData.map(player => player.totalPoints);
    const maxPoints = Math.max(...pointsArray);
    const minPoints = Math.min(...pointsArray);

    this.podiumHeights = this.podiumData.map(player => {
      if (maxPoints === 0) return this.minHeight;

      var normalizedHeight: number;

      if (this.invertOrder) {
        normalizedHeight = 1 - (player.totalPoints - minPoints) / (maxPoints - minPoints);
      } else {
        normalizedHeight = (player.totalPoints - minPoints) / (maxPoints - minPoints);
      }
      return Math.max(this.minHeight, normalizedHeight * (this.maxHeight - this.minHeight) + this.minHeight);
    })
  }

  private computeRanks(): void {
    const ranks: { player: Player, rank: number, height: number }[] = [];

    this.podiumData.forEach((player, i) => {
      const height = this.podiumHeights[i];
      const rank = i > 0 && player.totalPoints === this.podiumData[i - 1].totalPoints
        ? ranks[i - 1].rank
        : i + 1;
      ranks.push({ player, rank, height });
    });

    this.podiumPositions = ranks;
  }
}
