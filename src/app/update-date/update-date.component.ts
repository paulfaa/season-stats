import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistDataService } from '../service/playlist-data.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'update-date',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update-date.component.html',
  styleUrls: ['./update-date.component.scss']
})
export class UpdateDateComponent {

  lastUpdateDate$: Observable<Date | undefined>;

  constructor(private playlistData: PlaylistDataService) {
    this.lastUpdateDate$ = playlistData.lastThreePlaylists$.pipe(
      map(data => data.length > 0 ? new Date(data[data.length - 1].playlistDate) : undefined)
    );
  }
}
