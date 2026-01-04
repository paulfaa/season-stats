import { Injectable } from '@angular/core';
import { startWith, interval, map, Observable, shareReplay, Subject, switchMap, takeUntil, merge } from 'rxjs';
import { PlaylistData } from '../models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistDataService {
  private destroy$ = new Subject<void>();
  private TWELVE_HOURS_IN_MS: number = 12 * 60 * 60 * 1000;
  private manualRefresh$ = new Subject<void>();

  constructor(private parsingService: ApiService) { }

  public playlistData$: Observable<PlaylistData[]> = merge(
    interval(this.TWELVE_HOURS_IN_MS).pipe(startWith(0)), // Emits immediately and every 12 hours
    this.manualRefresh$
  ).pipe(
    // server always sorts data from oldest to newest
    switchMap(() => this.parsingService.getAllPlaylists()),
    shareReplay(1),
    takeUntil(this.destroy$)
  );

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public refreshPlaylists(): void {
    this.manualRefresh$.next();
  }

  public lastThreePlaylists$: Observable<PlaylistData[]> = this.playlistData$.pipe(
    map(playlists => playlists.slice(Math.max(playlists.length - 3, 0))
    )
  )
}