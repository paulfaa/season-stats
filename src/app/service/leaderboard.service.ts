import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ALL_NAMES, Player, PlayerPoints, PlayerResult, Playlist, PlaylistBreakdown, PlaylistData, RaceResults } from '../models';
import { PlaylistDataService } from './playlist-data.service';
import { Utils } from '../util/utils';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  constructor(private playlistDataService: PlaylistDataService) {
  }

  public getPlaylistBreakdown(): Observable<PlaylistBreakdown> {
  return this.playlistDataService.playlistData$.pipe(
    map(playlists => this.generatePlaylistBreakdown(playlists))
  );
}

  public getOverallLeaderboard(): Observable<PlayerResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      map(playlists => this.generateOverallLeaderboard(playlists))
    );
  }

  private generatePlaylistBreakdown(playlists: PlaylistData[]): PlaylistBreakdown {
    const breakdown: PlaylistBreakdown = { playlists: [] };

    playlists.forEach(playlist => {
      const date = new Date(playlist.playlistDate);
      const missingNames = [...ALL_NAMES];
      const currentResults: PlayerPoints[] = [];

      playlist.players.forEach((player: Player, index: number) => {
        if (missingNames.includes(player.name)) {
          const nameIndex = missingNames.indexOf(player.name);
          if (nameIndex > -1) {
            missingNames.splice(nameIndex, 1);
          }
        }
  
        const playerPoints: PlayerPoints = {
          playerName: player.name,
          championshipPoints: Utils.calculateChampionshipPoints(index) || 0,
          playlistPoints: player.totalPoints
        };
        currentResults.push(playerPoints);
      });
  
      missingNames.forEach(name => {
        currentResults.push({
          playerName: name,
          championshipPoints: 0,
          playlistPoints: 0
        });
      });
  
      breakdown.playlists.push({
        date,
        results: currentResults
      });
    });
  
    return breakdown;
  }

  private generateOverallLeaderboard(playlists: PlaylistData[]): PlayerResult[] {
    const pointsPerPlayer: Record<string, number> = {};
    playlists.forEach(playlist => {
      playlist.players.forEach((player, index) => {
        if (!pointsPerPlayer[player.name]) {
          pointsPerPlayer[player.name] = 0;
        }
        pointsPerPlayer[player.name] += Utils.calculateChampionshipPoints(index) || 0
      });
    });
    const totalResults = Object.entries(pointsPerPlayer).map(([playerName, points]) => ({
      playerName,
      points
    })).sort((a, b) => b.points - a.points);
    return totalResults;
  }
}
