import { Injectable } from '@angular/core';
import { startWith, interval, map, Observable, shareReplay, Subject, switchMap, takeUntil } from 'rxjs';
import { PlaylistData } from '../models';
import { ParsingService } from './parsing.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistDataService {
  private destroy$ = new Subject<void>();
  private TWELVE_HOURS_IN_MS: number = 12 * 60 * 60 * 1000;

  constructor(private parsingService: ParsingService) { }

  public playlistData$: Observable<PlaylistData[]> = interval(this.TWELVE_HOURS_IN_MS).pipe(
  startWith(0), // Emit immediately on subscription
  switchMap(() => this.parsingService.getAllPlaylists()),
  shareReplay(1),
  takeUntil(this.destroy$)
);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public lastPlaylistDate$: Observable<Date | undefined> = this.playlistData$.pipe(
    map(playlists => playlists.length > 0
      ? new Date(playlists[playlists.length - 1].playlistDate)
      : undefined
    )
  );

  public lastPlaylistName$: Observable<string | undefined> = this.playlistData$.pipe(
    map(playlists => playlists.length > 0
      ? playlists[playlists.length - 1].playlistName
      : undefined
    )
  );
}