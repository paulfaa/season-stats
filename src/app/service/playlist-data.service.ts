import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Playlist } from '../models';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistDataService {
  private playlistDataSubject = new BehaviorSubject<Playlist[]>([]);
  public playlistData$ = this.playlistDataSubject.asObservable();
  
  private lastPlaylistDateSubject = new BehaviorSubject<Date | undefined>(undefined);
  public lastPlaylistDate$ = this.lastPlaylistDateSubject.asObservable();

  constructor(private googleSheetsService: GoogleSheetsService) {
    this.googleSheetsService.fetchSheetsPlaylistData().subscribe({
      next: data => {
        this.playlistDataSubject.next(data);
        this.updateLastPlaylistDate(data);
      },
      error: err => console.error('Error fetching data from Google Sheets', err)
    });
  }

  public getPlaylistDataSnapshot(): Playlist[] {
    return this.playlistDataSubject.value;
  }

  private updateLastPlaylistDate(playlists: Playlist[]): void {
    if (playlists.length > 0) {
      const latestDate = new Date(playlists[playlists.length - 1].date)
      this.lastPlaylistDateSubject.next(latestDate);
    } 
    else {
      this.lastPlaylistDateSubject.next(undefined);
    }
  }
}