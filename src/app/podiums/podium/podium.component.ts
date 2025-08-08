import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PodiumFormatPipe } from 'src/app/pipes/podium-format.pipe';
import { PodiumResult, Player, PodiumPosition } from 'src/app/models';

@Component({
  selector: 'app-podium',
  standalone: true,
  imports: [CommonModule, PodiumFormatPipe],
  templateUrl: './podium.component.html',
  styleUrls: ['./podium.component.scss']
})
export class PodiumComponent implements OnInit {
  @Input() podium!: PodiumResult;

  private maxHeight = 140;
  private minHeight = 80;
  private podiumHeights: number[] = [];
  podiumPositions: PodiumPosition[] = [];

  constructor() { }

  ngOnInit(): void {
    if (!this.podium) {
      throw new Error('Podium input is required');
    }
    this.computePodiumPositions();
    const podiumItems = document.querySelectorAll('.podium-item');
    podiumItems.forEach(item => {
      const randomDelay = Math.random() * 2;
      (item as HTMLElement).style.setProperty('--random-delay', randomDelay.toString());
    });
  }

  get podiumType(): 'points' | 'percentage' | 'ordinal' | 'default' {
    const title = this.podium.title.toLowerCase();
    if (title.includes('points') || title.includes('margin')) return 'points';
    if (title.includes('position')) return 'ordinal';
    if (title.includes('ratio') || title.includes('percentage') || title.includes('dedicated') || title.includes('cowardly')) return 'percentage';
    return 'default';
  }

  private computePodiumPositions(): void {
    this.computePodiumHeights();
    this.computeRanks();
  }

  private computePodiumHeights(): void {
    const pointsArray = this.podium.players.map(player => player.totalPoints);
    const maxPoints = Math.max(...pointsArray);
    const minPoints = Math.min(...pointsArray);

    this.podiumHeights = this.podium.players.map(player => {
      if (maxPoints === 0) return this.minHeight;

      var normalizedHeight: number;

      if (this.podium.invertOrder) {
        normalizedHeight = 1 - (player.totalPoints - minPoints) / (maxPoints - minPoints);
      } else {
        normalizedHeight = (player.totalPoints - minPoints) / (maxPoints - minPoints);
      }
      return Math.max(this.minHeight, normalizedHeight * (this.maxHeight - this.minHeight) + this.minHeight);
    })
  }

  private computeRanks(): void {
    const ranks: { player: Player, rank: number, height: number }[] = [];

    this.podium.players.forEach((player, i) => {
      const height = this.podiumHeights[i];
      const rank = i > 0 && player.totalPoints === this.podium.players[i - 1].totalPoints
        ? ranks[i - 1].rank
        : i + 1;
      ranks.push({ player, rank, height });
    });

    this.podiumPositions = ranks;
  }
}
