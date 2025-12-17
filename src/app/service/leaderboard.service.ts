import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ALL_NAMES, PlayerPoints, PlayerResult, PlaylistBreakdown, PlaylistData } from '../models';
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

  private generatePlaylistBreakdown(
    playlists: PlaylistData[]
  ): PlaylistBreakdown {

    const breakdown: PlaylistBreakdown = { playlists: [] };

    playlists.forEach(playlist => {
      const date = new Date(playlist.playlistDate);
      const missingNames = new Set(ALL_NAMES);
      const currentResults: PlayerPoints[] = [];

      const championshipPointsForPlaylist =
        Utils.calculateChampionshipPointsByPlayer(
          playlist.players.map(p => ({
            name: p.name,
            totalPoints: p.totalPoints
          }))
        );

      playlist.players.forEach(player => {
        currentResults.push({
          playerName: player.name,
          championshipPoints: championshipPointsForPlaylist[player.name] ?? 0,
          playlistPoints: player.totalPoints
        });

        missingNames.delete(player.name);
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

    console.log('Generated Playlist Breakdown:', breakdown);
    return breakdown;
  }


  private generateOverallLeaderboard(
    playlists: PlaylistData[]
  ): PlayerResult[] {

    const pointsPerPlayer: Record<string, number> = {};
    ALL_NAMES.forEach(name => (pointsPerPlayer[name] = 0));

    playlists.forEach(playlist => {

      const championshipPointsForPlaylist =
        Utils.calculateChampionshipPointsByPlayer(
          playlist.players.map(p => ({
            name: p.name,
            totalPoints: p.totalPoints
          }))
        );

      for (const [playerName, points] of Object.entries(championshipPointsForPlaylist)) {
        pointsPerPlayer[playerName] += points;
      }
    });

    return Object.entries(pointsPerPlayer)
      .map(([playerName, points]) => ({ playerName, points }))
      .sort((a, b) => b.points - a.points);
  }


}
