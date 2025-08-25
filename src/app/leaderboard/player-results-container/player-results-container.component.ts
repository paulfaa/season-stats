import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerPoints, PlayerResult } from '../../models';
import { PlayerResultComponent } from '../player-result/player-result.component';

@Component({
  selector: 'player-results-container',
  standalone: true,
  imports: [CommonModule, PlayerResultComponent],
  templateUrl: './player-results-container.component.html',
  styleUrls: ['./player-results-container.component.scss']
})
export class PlayerResultsContainerComponent implements OnInit {

  @Input() date: Date | undefined;
  @Input() results: PlayerPoints[] | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
