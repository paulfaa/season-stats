import { Injectable } from '@angular/core';
import { Player, Playlist, PodiumResult, PodiumResult as PodiumStat } from '../models';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class StatsCalculatorService {

  private playlistData: Playlist[] = [];
  private singleStats: any[] = [];
  private podiumStats: PodiumStat[] = [];

  //individual stats
  private totalNumberOfPlaylists: number = 0;
  private averagePlaylistLength: number = 0;
  private averageSquadSize: number = 0;
  private mostPopularDay: String = '';
  private longestWinningStreak: number = 0;

  //stats for podium
  private mostWins: PodiumStat | undefined;
  private mostSecondPlaces: PodiumStat | undefined;
  private mostLastPlaces: PodiumStat | undefined;
  private mostDraws: PodiumStat | undefined;
  private winRatio: PodiumStat | undefined;
  private averagePosition: PodiumStat | undefined;
  private averageScore: PodiumStat | undefined;
  private averageWinMargin: PodiumStat | undefined;
  private dedicationPercentage: PodiumStat | undefined;
  private mostPlaylistsCreated: PodiumStat | undefined;

  constructor(private googleSheetsService: GoogleSheetsService) {
    this.googleSheetsService.fetchSheetsPlaylistData().subscribe(data => {
      this.playlistData = data;
    });
  }


  public calculateTotalNumberOfPlaylists(): number {
    return this.playlistData.length;
  }

  public calculateAveragePlaylistLength(): number {
    return this.playlistData.reduce((acc, playlist) => acc + playlist.length, 0) / this.playlistData.length;
  }

  public calculateAverageSquadSize(): number {
    return this.playlistData.reduce((acc, playlist) => acc + playlist.players.length, 0) / this.playlistData.length;
  }

  public calculateMostPopularDay(): string {
    const dayCounts: Record<string, number> = {};

    this.playlistData.forEach(playlist => {
      const day = new Date(playlist.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
    return sortedDays[0][0];
  }

  private calculateLongestWinningStreak(playlists: Playlist[]): Player {
    // Step 1: Sort playlists by date (assuming date format is YYYY-MM-DD)
    playlists.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let longestStreak = 0;
    let currentStreak = 0;
    let currentWinner = "";
    let bestPlayer = "";

    // Step 2: Iterate through playlists to track streaks
    playlists.forEach(playlist => {
      //ignore draws
      if (playlist.players[0].points == playlist.players[1].points) {
        return;
      }
      const winner = playlist.players[0].name; // First player is the winner

      if (winner === currentWinner) {
        currentStreak++; // Extend the streak
      } else {
        currentWinner = winner;
        currentStreak = 1; // Reset streak
      }

      // Update longest streak and best player
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        bestPlayer = currentWinner;
      }
    });

    return { name: bestPlayer, points: longestStreak }; // Return the player with the longest winning streak
  }


  private calculateMostWins(): PodiumResult {
    const winCounts: Record<string, number> = {};

    // Step 1: Count second-place finishes
    this.playlistData.forEach(playlist => {
      const winner = playlist.players[0];

      // Increment their second-place count
      winCounts[winner.name] =
        (winCounts[winner.name] || 0) + 1;
    });

    // Step 2: Convert map to an array and sort it by count (descending)
    const sortedPlayers = Object.entries(winCounts)
      .map(([name, count]) => ({ name, points: count })) // 'points' represents second-place finishes
      .sort((a, b) => b.points - a.points);

    // Step 3: Take the top 3 players
    const topWinners = sortedPlayers.slice(0, 3);

    // Step 4: Return the result
    return {
      title: "Most Wins",
      players: topWinners
    };
  }

  private calculateMostSecondPlaces(): PodiumResult {
    const secondPlaceCounts: Record<string, number> = {};

    // Step 1: Count second-place finishes
    this.playlistData.forEach(playlist => {
      if (playlist.players[0].points == playlist.players[1].points) {
        for (var i = 0; i <= 1; i++) {
          var secondPlacePlayer = playlist.players[i];
          secondPlaceCounts[secondPlacePlayer.name] =
            (secondPlaceCounts[secondPlacePlayer.name] || 0) + 1;
        }
      }
      else {
        const secondPlacePlayer = playlist.players[playlist.players.length - 2];
        secondPlaceCounts[secondPlacePlayer.name] =
          (secondPlaceCounts[secondPlacePlayer.name] || 0) + 1;
      }
    });

    // Step 2: Convert map to an array and sort it by count (descending)
    const sortedPlayers = Object.entries(secondPlaceCounts)
      .map(([name, count]) => ({ name, points: count })) // 'points' represents second-place finishes
      .sort((a, b) => b.points - a.points);

    // Step 3: Take the top 3 players
    const topSecondPlacers = sortedPlayers.slice(0, 3);

    // Step 4: Return the result
    return {
      title: "Most Second Place Finishes",
      players: topSecondPlacers
    };
  }

  private calculateMostLastPlaces(): PodiumResult {
    // Step 1: Create a map to store last-place counts
    const lastPlaceCounts: Record<string, number> = {};

    // Step 2: Count occurrences of last-place finishes
    this.playlistData.forEach(playlist => {
      const lastPlayer = playlist.players[playlist.players.length - 1];
      // Increment their count
      lastPlaceCounts[lastPlayer.name] = (lastPlaceCounts[lastPlayer.name] || 0) + 1;
    });

    // Step 3: Convert map to an array and sort it by count (ascending)
    const sortedPlayers = Object.entries(lastPlaceCounts)
      .map(([name, count]) => ({ name, points: count }))
      .sort((a, b) => b.points - a.points);

    // Step 4: Take the bottom 3 players
    const worstPlayers = sortedPlayers.slice(0, 3);

    // Step 5: Return the result in the expected format
    return {
      title: "Most Last Place Finishes",
      players: worstPlayers
    };
  }

  private calculateHighestWinRatio(playlists: Playlist[]): PodiumResult {
    const playerStats: Record<string, { wins: number; appearances: number }> = {};

    // Step 1: Count wins and appearances
    playlists.forEach(playlist => {
      if (playlist.players[0].points == playlist.players[1].points) {
        return
      }

      const winner = playlist.players[0]; 

        playlist.players.forEach(player => {
          if (!playerStats[player.name]) {
            playerStats[player.name] = { wins: 0, appearances: 0 };
          }
          playerStats[player.name].appearances += 1; // Count participation
        });

        playerStats[winner.name].wins += 1; // Count win
    });

    // Step 2: Compute win ratios
    const winRatios = Object.entries(playerStats)
      .map(([name, stats]) => ({
        name,
        points: (stats.wins / stats.appearances) * 100 // Convert to percentage
      }));

    // Step 3: Sort by highest win ratio
    const topWinners = winRatios.sort((a, b) => b.points - a.points).slice(0, 3);

    // Step 4: Return result
    return {
      title: "Highest Win Ratio",
      players: topWinners
    };
  }


  private calculateHighestAttendanceRate(playlists: Playlist[]): PodiumResult {
    const totalPlaylists = playlists.length;
    const attendanceCounts: Record<string, number> = {};

    // Step 1: Count the number of playlists each player participated in
    playlists.forEach(playlist => {
      playlist.players.forEach(player => {
        attendanceCounts[player.name] = (attendanceCounts[player.name] || 0) + 1;
      });
    });

    // Step 2: Convert to an array and calculate attendance percentage
    const attendanceRates = Object.entries(attendanceCounts)
      .map(([name, count]) => ({
        name,
        points: (count / totalPlaylists) * 100  // Convert to percentage
      }));

    // Step 3: Sort by highest attendance percentage
    const mostDedicated = attendanceRates.sort((a, b) => b.points - a.points).slice(0, 3);

    // Step 4: Return result
    return {
      title: "Most Dedicated Players",
      players: mostDedicated
    };
  }

  private calculateTopAveragePoints(): PodiumResult {
    const playerStats: Record<string, { totalPoints: number; count: number }> = {};

    // Step 1: Accumulate points and count appearances
    this.playlistData.forEach(playlist => {
      playlist.players.forEach(player => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = { totalPoints: 0, count: 0 };
        }
        playerStats[player.name].totalPoints += player.points;
        playerStats[player.name].count += 1;
      });
    });

    // Step 2: Calculate average points per playlist
    const avgPointsArray = Object.entries(playerStats).map(([name, stats]) => ({
      name,
      points: stats.totalPoints / stats.count  // Compute average
    }));

    // Step 3: Sort by highest average points
    const topPlayers = avgPointsArray.sort((a, b) => b.points - a.points).slice(0, 3);

    // Step 4: Return in the required format
    return {
      title: "Highest Average Points",
      players: topPlayers
    };
  }

  private generatePodiumStat(title: string, players: Player[]): PodiumStat {
    return {
      title: title,
      players: players
    };
  }


}
