import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlaylistData } from '../models';

@Injectable({ providedIn: 'root' })
export class ParsingService {

  private apiUrl = environment.apiUrl;
  private userRoleSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) { }

  public get userRole(): string {
    return this.userRoleSubject.getValue()!;
  }

  public getAllPlaylists(): Observable<PlaylistData[]> {
    return this.http.get<PlaylistData[]>(`${this.apiUrl}/playlists`, { withCredentials: true })
      .pipe(
        tap(data => console.log('Fetched playlists:', data)),
        catchError(error => {
          console.error('Error fetching playlists:', error);
          return throwError(() => error);
        })
      );
  }

  public login(password: string): Observable<{success: boolean, role: string }> {
    return this.http.post<{success: boolean, role: string }>(`${this.apiUrl}/login`, { password }, { withCredentials: true })
      .pipe(
        tap(response => {
          this.userRoleSubject.next(response.role);
        }),
        catchError(error => {
          console.error('Error connecting to authentication server:', error);
          return throwError(() => error);
        })
      );
  }

  public checkAuth(): Observable<{ role: string }> {
    return this.http.get<{ role: string }>(`${this.apiUrl}/check`, { withCredentials: true })
      .pipe(
        tap(response => {
          this.userRoleSubject.next(response.role);
        }),
        catchError(error => {
          console.error('Error connecting to authentication server:', error);
          return throwError(() => error);
        })
      );
  }

  public uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData, { withCredentials: true });
  }

  public saveToDatabase(playlistData: PlaylistData): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, playlistData, { withCredentials: true });
  }
}
