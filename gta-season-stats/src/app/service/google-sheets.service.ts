import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { Playlist } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private static readonly SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAZGEvx2dZEIRC7rmpoV_Zqz0RAJhZ8rI5OnVOcVege6Oni9A7KDK2fN9R98Q1UJRcZLlMn639gjvL/pub?output=xlsx';
  public lastRefreshed: string = '';

  constructor(private http: HttpClient) {}

  fetchSheetsPlaylistData(): Observable<Playlist[]> {
    const lastUpdate = localStorage.getItem('lastUpdate');
    const storedData = localStorage.getItem('sheetsData');
    // If data was fetched less than an hour ago, use the cached data
    if (lastUpdate && storedData && Date.now() - parseInt(lastUpdate) < 1000 * 60 * 60) {
      console.info('Using cached data');
      const arrayBuffer = this.base64ToArrayBuffer(storedData);
      this.lastRefreshed = lastUpdate;
      return of(this.parseExcel(arrayBuffer));
    }
    else {
      console.info('Fetching new data');
      return this.http.get(GoogleSheetsService.SHEET_URL, { responseType: 'arraybuffer' }).pipe(
        tap(data => {
          localStorage.setItem('sheetsData', this.arrayBufferToBase64(data));
          const currentDate = Date.now().toString();
          this.lastRefreshed = currentDate;
          localStorage.setItem('lastUpdate', currentDate);
        }),
        map(data => this.parseExcel(data))
      );
    }
  }

  private parseExcel(data: ArrayBuffer): any[] {
    const workbook: XLSX.WorkBook = XLSX.read(new Uint8Array(data), { type: 'array' });

    const playlistsSheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    const playersSheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);

    const result = this.mergeData(playlistsSheet, playersSheet);
    console.log(result);
    return result;
  }

  private mergeData(playlists: any[], players: any[]): Playlist[] {
    return playlists.map(pl => ({
      date: this.formatDate(pl['Date']),
      name: pl['Playlist_Name'],
      length: parseInt(pl['Count_Events']),
      players: players
        .filter(p => p['Date'] === pl['Date'])
        .map(p => ({
          name: p['Username'],
          secondLastEventPoints: parseInt(p['SecondLastEventPoints']),
          totalPoints: parseInt(p['TotalPoints'])
        }))
    }));
  }

  private formatDate(serial: number): string {
    const date = new Date((serial - 25569) * 86400000);
    return date.toISOString().split('T')[0];
}

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

}
