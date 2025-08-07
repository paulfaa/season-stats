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
    return this.http.get<PlaylistData[]>(`${this.apiUrl}/playlists`)
      .pipe(
        catchError(error => {
          console.error('Error fetching playlists:', error);
          return throwError(() => error);
        })
      );
  }

  public login(password: string): Observable<{ success: boolean, role: string, token: string }> {
    return this.http.post<{ success: boolean, role: string, token: string }>(`${this.apiUrl}/login`, { password })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
          this.userRoleSubject.next(response.role);
        }),
        catchError(error => {
          console.error('Error connecting to authentication server:', error);
          return throwError(() => error);
        })
      );
  }

  public checkAuth(): Observable<{ role: string }> {
    return this.http.get<{ role: string }>(`${this.apiUrl}/check`)
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
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  public saveToDatabase(playlistData: PlaylistData): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, playlistData);
  }
}
