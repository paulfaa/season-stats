import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subject, takeUntil } from 'rxjs';
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

  private destroy$ = new Subject<void>();
  private TWELVE_HOURS_IN_MS: number = 12 * 60 * 60 * 1000;

  constructor(private googleSheetsService: GoogleSheetsService) {
    this.fetchAndUpdatePlaylistData();
    interval(this.TWELVE_HOURS_IN_MS)
    .pipe(takeUntil(this.destroy$)) 
    .subscribe(() => this.fetchAndUpdatePlaylistData());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchAndUpdatePlaylistData(): void {
    this.googleSheetsService.fetchSheetsPlaylistData().subscribe({
      next: data => {
        this.playlistDataSubject.next(data);
        this.updateLastPlaylistDate(data);
      },
      error: err => console.error('Error fetching data from Google Sheets', err)
    });
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