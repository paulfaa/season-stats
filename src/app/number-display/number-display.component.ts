import { Component, Input, OnInit } from '@angular/core';
import { IndividualResult } from '../models';

@Component({
  selector: 'app-number-display',
  templateUrl: './number-display.component.html',
  styleUrls: ['./number-display.component.scss']
})
export class NumberDisplayComponent implements OnInit {

  @Input() individualResult: IndividualResult | undefined = undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
