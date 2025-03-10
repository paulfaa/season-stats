import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private static readonly SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAZGEvx2dZEIRC7rmpoV_Zqz0RAJhZ8rI5OnVOcVege6Oni9A7KDK2fN9R98Q1UJRcZLlMn639gjvL/pub?output=xlsx';

  constructor(private http: HttpClient) {}

  fetchExcel(): Observable<any[]> {
    return this.http.get(GoogleSheetsService.SHEET_URL, { responseType: 'arraybuffer' }).pipe(
      map(data => this.parseExcel(data))
    );
  }

  private parseExcel(data: ArrayBuffer): any[] {
    const workbook: XLSX.WorkBook = XLSX.read(new Uint8Array(data), { type: 'array' });

    const playlistsSheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    const playersSheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);

    return this.mergeData(playlistsSheet, playersSheet);
  }

  private mergeData(playlists: any[], players: any[]): any[] {
    return playlists.map(pl => ({
      date: pl['Date'],
      name: pl['Playlist_Name'],
      length: parseInt(pl['Count_Events']),
      players: players
        .filter(p => p['Date'] === pl['Date'])
        .map(p => ({
          name: p['Username'],
          points: parseInt(p['Points'])
        }))
    }));
  }

}
