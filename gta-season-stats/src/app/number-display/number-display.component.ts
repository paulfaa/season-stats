import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-number-display',
  templateUrl: './number-display.component.html',
  styleUrls: ['./number-display.component.scss']
})
export class NumberDisplayComponent implements OnInit {

  @Input() podiumData: { username?: string; points?: number } = {username: undefined, points: undefined};
  @Input() numberTitle: string = "";

  constructor() { }

  ngOnInit(): void {
  }

}
