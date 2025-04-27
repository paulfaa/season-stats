import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Playlist } from '../models';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistDataService {
  private playlistDataSubject = new BehaviorSubject<Playlist[]>([]);
  playlistData$ = this.playlistDataSubject.asObservable();

  constructor(private googleSheetsService: GoogleSheetsService) {
    this.googleSheetsService.fetchSheetsPlaylistData().subscribe({
      next: data => this.playlistDataSubject.next(data),
      error: err => console.error('Fetch error', err)
    });
  }

  public getPlaylistDataSnapshot(): Playlist[] {
    return this.playlistDataSubject.value;
  }
}