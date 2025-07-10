import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndividualResult } from '../models';

@Component({
  selector: 'app-number-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './number-display.component.html',
  styleUrls: ['./number-display.component.scss']
})
export class NumberDisplayComponent implements OnInit {

  @Input() individualResult: IndividualResult | undefined = undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
