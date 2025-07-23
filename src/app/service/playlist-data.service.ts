import { Injectable } from '@angular/core';
import { startWith, interval, map, Observable, shareReplay, Subject, switchMap, takeUntil } from 'rxjs';
import { Playlist } from '../models';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistDataService {
  private destroy$ = new Subject<void>();
  private TWELVE_HOURS_IN_MS: number = 12 * 60 * 60 * 1000;

  constructor(private googleSheetsService: GoogleSheetsService) { }

  public playlistData$: Observable<Playlist[]> = interval(this.TWELVE_HOURS_IN_MS).pipe(
  startWith(0), // Emit immediately on subscription
  switchMap(() => this.googleSheetsService.fetchSheetsPlaylistData()),
  shareReplay(1),
  takeUntil(this.destroy$)
);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public lastPlaylistDate$: Observable<Date | undefined> = this.playlistData$.pipe(
    map(playlists => playlists.length > 0
      ? new Date(playlists[playlists.length - 1].date)
      : undefined
    )
  );
}