import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ALL_NAMES, Player, PlayerResult, Playlist, PlaylistData, RaceResults } from '../models';
import { PlaylistDataService } from './playlist-data.service';
import { Utils } from '../util/utils';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

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

  private generateRaceByRaceBreakdown(playlists: PlaylistData[]): RaceResults {
    const allResults: RaceResults = { races: [] };

    playlists.forEach(playlist => {
      const date = new Date(playlist.playlistDate);
      const missingNames = [...ALL_NAMES];
      const currentResults: PlayerResult[] = [];

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

  private generateOverallLeaderboard(playlists: PlaylistData[]): PlayerResult[] {
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

  public calculatePoints(finishingPosition: number) {
    return Utils.calculatePoints(finishingPosition) || 0;
  }
}
