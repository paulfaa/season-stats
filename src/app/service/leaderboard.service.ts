import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ALL_NAMES, Player, PlayerResult, Playlist, RaceResults } from '../models';
import { PlaylistDataService } from './playlist-data.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

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
  }

  public getRaceBreakdown(): Observable<RaceResults> {
  return this.playlistDataService.playlistData$.pipe(
    map(playlists => this.generateRaceByRaceBreakdown(playlists))
  );
}

  public getOverallLeaderboard(): Observable<PlayerResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      map(playlists => this.generateOverallLeaderboard(playlists))
    );
  }

  private generateRaceByRaceBreakdown(playlists: Playlist[]): RaceResults {
    const allResults: RaceResults = { races: [] };

    playlists.forEach(playlist => {
      const date = new Date(playlist.date);
      const missingNames = [...ALL_NAMES];
      const currentResults: PlayerResult[] = [];
      // const numberOfDrivers = playlist.players.length;

      playlist.players.forEach((player: Player, index: number) => {
        if (missingNames.includes(player.name)) {
          const nameIndex = missingNames.indexOf(player.name);
          if (nameIndex > -1) {
            missingNames.splice(nameIndex, 1);
          }
        }
  
        const playerResult: PlayerResult = {
          playerName: player.name,
          points: this.calculatePoints(index)
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

  private generateOverallLeaderboard(playlists: Playlist[]): PlayerResult[] {
    const pointsPerPlayer: Record<string, number> = {};
    playlists.forEach(playlist => {
      playlist.players.forEach((player, index) => {
        if (!pointsPerPlayer[player.name]) {
          pointsPerPlayer[player.name] = 0;
        }
        pointsPerPlayer[player.name] += this.calculatePoints(index)
      });
    });
    const totalResults = Object.entries(pointsPerPlayer).map(([playerName, points]) => ({
      playerName,
      points
    })).sort((a, b) => b.points - a.points);
    return totalResults;
  }

  private calculatePoints(finishingPosition: number) {
    return this.pointsMap.get(finishingPosition) || 0;
  }
}
