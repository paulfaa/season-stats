import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, switchMap, tap } from 'rxjs';
import { allNames, Player, PlayerResult, Playlist, RaceResults } from '../models';
import { PlaylistDataService } from './playlist-data.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  private raceBreakdownSubject = new BehaviorSubject<RaceResults>({ races: [] });
  public raceBreakdown$ = this.raceBreakdownSubject.asObservable();
  private leaderboardSubject = new BehaviorSubject<PlayerResult[]>([]);
  public leaderboard$ = this.leaderboardSubject.asObservable();
  private playlistData: Playlist[] = [];

  private pointsMap = new Map<number, number>([
    [0, 25],
    [1, 18],
    [2, 15],
    [3, 12],
    [4, 10],
    [5, 8],
    [6, 6],
    [7, 4]
  ])

  constructor(private playlistDataService: PlaylistDataService) {
    this.playlistDataService.playlistData$.subscribe(data => {
      this.playlistData = data;
    });
  }

  public getRaceBreakdown(): Observable<RaceResults> {
    return this.playlistDataService.playlistData$.pipe(
      tap(() => {
        const breakdown = this.generateRaceByRaceBreakdown();
        this.raceBreakdownSubject.next(breakdown);
      }),
      switchMap(() => this.raceBreakdown$)
    );
  }

  public getOverallLeaderboard(): Observable<PlayerResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      tap(() => {
        const leaderboard = this.generateOverallLeaderboard();
        this.leaderboardSubject.next(leaderboard);
      }),
      switchMap(() => this.leaderboard$)
    );
  }

  private generateRaceByRaceBreakdown(): RaceResults {
    const allResults: RaceResults = { races: [] };
  
    this.playlistData.forEach(element => {
      const date = new Date(element.date);
      const missingNames = [...allNames];
      const currentResults: PlayerResult[] = [];
      const numberOfDrivers = element.players.length;
  
      element.players.forEach((player: Player, index: number) => {
        if (missingNames.includes(player.name)) {
          const nameIndex = missingNames.indexOf(player.name);
          if (nameIndex > -1) {
            missingNames.splice(nameIndex, 1);
          }
        }
  
        const playerResult: PlayerResult = {
          playerName: player.name,
          points: this.calculatePoints(index, numberOfDrivers)
        };
        currentResults.push(playerResult);
      });
  
      missingNames.forEach(name => {
        currentResults.push({
          playerName: name,
          points: 0
        });
      });
  
      allResults.races.push({
        date,
        players: currentResults
      });
    });
  
    return allResults;
  }

  private generateOverallLeaderboard(): PlayerResult[] {
    const pointsPerPlayer: Record<string, number> = {};
    this.playlistData.forEach(playlist => {
      const numberOfDrivers = playlist.players.length;
      playlist.players.forEach((player, index) => {
        if (!pointsPerPlayer[player.name]) {
          pointsPerPlayer[player.name] = 0;
        }
        pointsPerPlayer[player.name] = player.totalPoints + this.calculatePoints(index, numberOfDrivers)
      });
    });
    const totalResults = Object.entries(pointsPerPlayer).map(([playerName, points]) => ({
      playerName,
      points
    })).sort((a, b) => b.points - a.points);
    return totalResults;
  }

  private calculatePoints(finishingPosition: number, numberOfPlayers: number) {
    const pointsArray = [25, 18, 15, 12, 10, 8, 6, 4]; //check if better to declare as static constant
    var bonus = 0
    if (numberOfPlayers > 4) {
      if(finishingPosition <= 3) {
        bonus = numberOfPlayers - 4;
      }
    }
    const basePoints = pointsArray[finishingPosition];
    return basePoints + bonus;
  }
}
