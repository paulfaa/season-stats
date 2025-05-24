import { Component, Input, OnInit } from '@angular/core';
import { PlayerResult } from '../models';

@Component({
  selector: 'player-results-container',
  templateUrl: './player-results-container.component.html',
  styleUrls: ['./player-results-container.component.scss']
})
export class PlayerResultsContainerComponent implements OnInit {

  @Input() date: Date | undefined;
  @Input() results: PlayerResult[] | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
