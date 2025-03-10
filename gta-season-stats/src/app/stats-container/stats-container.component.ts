import { Component, OnInit } from '@angular/core';
import { GoogleSheetsService } from '../service/google-sheets.service';

@Component({
  selector: 'stats-container',
  templateUrl: './stats-container.component.html',
  styleUrls: ['./stats-container.component.scss']
})
export class StatsContainerComponent implements OnInit {

  constructor(private sheetsService: GoogleSheetsService) { }

  ngOnInit(): void {
    const result = this.sheetsService.fetchSheetsPlaylistData().subscribe(result => {
      console.log(result);
    });
  }
}
