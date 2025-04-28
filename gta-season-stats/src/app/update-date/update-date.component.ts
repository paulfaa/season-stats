import { Component, OnInit } from '@angular/core';
import { PlaylistDataService } from '../service/playlist-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'update-date',
  templateUrl: './update-date.component.html',
  styleUrls: ['./update-date.component.scss']
})
export class UpdateDateComponent implements OnInit {

  lastUpdateDate$?: Observable<Date | undefined>;
  
  constructor(private playlistData: PlaylistDataService) { }

  ngOnInit(): void {
    this.lastUpdateDate$ = this.playlistData.lastPlaylistDate$;
  }
}
