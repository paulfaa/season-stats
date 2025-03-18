import { Injectable } from '@angular/core';
import { IndividualResult, Player, Playlist, PodiumResult, PodiumResult as PodiumStat } from '../models';
import { GoogleSheetsService } from './google-sheets.service';
import { BehaviorSubject, filter, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsCalculatorService {

  private playlistDataSubject = new BehaviorSubject<Playlist[]>([]);
  public playlistData$ = this.playlistDataSubject.asObservable();
  private podiumDataSubject = new BehaviorSubject<PodiumResult[]>([]);
  public podiumData$ = this.podiumDataSubject.asObservable();
  private individualDataSubject = new BehaviorSubject<IndividualResult[]>([]);
  public individualData$ = this.individualDataSubject.asObservable();

  constructor(private googleSheetsService: GoogleSheetsService) {
    this.fetchPlaylistData();
  }

  private fetchPlaylistData(): void {
    this.googleSheetsService.fetchSheetsPlaylistData().subscribe({
      next: (data) => {
        this.playlistDataSubject.next(data);
        this.updateAllIndividualStats();
        this.updateAllGroupStats();  // ✅ Now updates stats after data is loaded
      },
      error: (error) => console.error('Error fetching playlist data:', error)
    });
  }

  public getAllPodiumStats(): Observable<PodiumResult[]> {
    return this.playlistData$.pipe(
      filter(data => data.length > 0), 
      tap(() => this.updateAllGroupStats()),
      switchMap(() => this.podiumData$)
    );
  }

  public getAllIndividualStats(): Observable<IndividualResult[]> {
    return this.playlistData$.pipe(
      filter(data => data.length > 0), 
      tap(() => this.updateAllIndividualStats()),
      switchMap(() => this.individualData$) 
    );
  }

  public getAllChartData(): Observable<any> {
    return of("todo")
  }

  public updateAllIndividualStats(): void {
    const stats = [];
    stats.push(this.calculateTotalNumberOfPlaylists());
    stats.push(this.calculateAveragePlaylistLength());
    stats.push(this.calculateAverageSquadSize());
    stats.push(...this.calculateMostPopularDays());
    stats.push(this.calculateLongestWinningStreak());
    this.individualDataSubject.next(stats);
  }

  public updateAllGroupStats(): void {
    const stats = [];
    stats.push(this.calculateMostWins());
    stats.push(this.calculateMostSecondPlaces());
    stats.push(this.calculateMostLastPlaces());
    
    //methods returning multiple stats
    stats.push(...this.calculateWinRatios());
    stats.push(...this.calculateAverageFinishingPositions());
    stats.push(...this.calculateAverageScore());
    stats.push(...this.calculateAverageWinMargins());
    stats.push(...this.calculateDedicationRates());
    this.podiumDataSubject.next(stats)
  }

  private calculateTotalNumberOfPlaylists(): IndividualResult {
    return { title: 'Total Number of Playlists', value: this.playlistDataSubject.value.length }
  }

  private calculateAveragePlaylistLength(): IndividualResult {
    const avgLength = this.playlistDataSubject.value.reduce((acc, playlist) => acc + playlist.length, 0) / this.playlistDataSubject.value.length;
    return { title: 'Average Playlist Length', value: avgLength }
  }

  private calculateAverageSquadSize(): IndividualResult {
    const avgSize = this.playlistDataSubject.value.reduce((acc, playlist) => acc + playlist.players.length, 0) / this.playlistDataSubject.value.length;
    return { title: 'Average Squad Size', value: avgSize }
  }

  private calculateMostPopularDays(): IndividualResult[] {
    const dayCounts: Record<string, number> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      const day = new Date(playlist.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
    const mostPopularDay = sortedDays[0][0];
    const sortedLeastPopular = Object.entries(dayCounts).sort((a, b) => a[1] - b[1]); 
    const leastPopularDay = sortedLeastPopular[0][0];

    return [{ title: 'Most Popular Day', subtitle: mostPopularDay }, { title: 'Least Popular Day', subtitle: leastPopularDay }];
  }

  private calculateLongestWinningStreak(): IndividualResult {
    this.playlistDataSubject.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let longestStreak = 0;
    let currentStreak = 0;
    let currentWinner = "";
    let bestPlayer = "";

    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
        return;
      }
      const winner = playlist.players[0].name; 

      if (winner === currentWinner) {
        currentStreak++;
      } else {
        currentWinner = winner;
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        bestPlayer = currentWinner;
      }
    });

    return { title: 'Longest Winning Streak:', subtitle: bestPlayer, value: longestStreak };
  }

  private calculateMostWins(): PodiumResult {
    const winCounts: Record<string, number> = {};

    //ignore result if tied for first
    this.playlistDataSubject.value.forEach(playlist => {
      if (playlist.players[0].points == playlist.players[1].points) {
        return
      }
      const winner = playlist.players[0];

      winCounts[winner.name] =
        (winCounts[winner.name] || 0) + 1;
    });

    // Step 2: Convert map to an array and sort it by count (descending)
    const sortedPlayers = Object.entries(winCounts)
      .map(([name, count]) => ({ name, points: count }))
      .sort((a, b) => b.points - a.points);

    return this.generateBestThreePodiumStat("Most Wins", sortedPlayers);
  }

  private calculateMostSecondPlaces(): PodiumResult {
    const secondPlaceCounts: Record<string, number> = {};

    // Step 1: Count second-place finishes
    this.playlistDataSubject.value.forEach(playlist => {
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

    return this.generateBestThreePodiumStat("Most Second Place Finishes", sortedPlayers);
  }

  private calculateMostLastPlaces(): PodiumResult {
    // Step 1: Create a map to store last-place counts
    const lastPlaceCounts: Record<string, number> = {};

    // Step 2: Count occurrences of last-place finishes
    this.playlistDataSubject.value.forEach(playlist => {
      const lastPlayer = playlist.players[playlist.players.length - 1];
      // Increment their count
      lastPlaceCounts[lastPlayer.name] = (lastPlaceCounts[lastPlayer.name] || 0) + 1;
    });

    // Step 3: Convert map to an array and sort it by count (ascending)
    const sortedPlayers = Object.entries(lastPlaceCounts)
      .map(([name, count]) => ({ name, points: count }))
      .sort((a, b) => b.points - a.points);

    return this.generateBestThreePodiumStat("Most Last Place Finishes", sortedPlayers);
  }

  private calculateWinRatios(): PodiumResult[] {
    const playerStats: Record<string, { wins: number; appearances: number }> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      if(this.playlistWasDraw(playlist)){
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

    const highestWinRatio = this.generateBestThreePodiumStat("Highest Win Ratio", winRatios);
    const lowestWinRatio = this.generateWorstThreePodiumStat("Lowest Win Ratio", winRatios);
    return [highestWinRatio, lowestWinRatio];
  }

  private calculateAverageFinishingPositions(): PodiumResult[] {
    const playerStats: Record<string, { totalPosition: number; appearances: number }> = {};

    // Step 1: Sum finishing positions and count appearances
    this.playlistDataSubject.value.forEach(playlist => {
      playlist.players.forEach((player, index) => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = { totalPosition: 0, appearances: 0 };
        }
        playerStats[player.name].totalPosition += (index + 1); // Position (1-based index)
        playerStats[player.name].appearances += 1;
      });
    });

    // Step 2: Compute average finishing position
    const averagePositions = Object.entries(playerStats)
      .map(([name, stats]) => ({
        name,
        points: stats.totalPosition / stats.appearances // Lower is better
      }));

    // Step 3: Sort by best average position (lowest value is better)
    const bestAveragePositions = this.generateBestThreePodiumStat("Best Average Finishing Position", averagePositions);
    const worstAveragePositions = this.generateWorstThreePodiumStat("Worst Average Finishing Position", averagePositions);
    return [bestAveragePositions, worstAveragePositions];
  }

  private calculateAverageWinMargins(): PodiumResult[] {
    const playerStats: Record<string, { totalMargin: number; wins: number }> = {};

    // Step 1: Calculate win margins for each winner
    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
        return
      }
      const sortedPlayers = [...playlist.players].sort((a, b) => b.points - a.points);
      const winner = sortedPlayers[0];
      const secondPlace = sortedPlayers[1];

      // Calculate win margin
      const winMargin = winner.points - secondPlace.points;

      // Track stats
      if (!playerStats[winner.name]) {
        playerStats[winner.name] = { totalMargin: 0, wins: 0 };
      }
      playerStats[winner.name].totalMargin += winMargin;
      playerStats[winner.name].wins += 1;
    });

    // Step 2: Compute average win margin
    const averageWinMargins = Object.entries(playerStats)
      .map(([name, stats]) => ({
        name,
        points: stats.totalMargin / stats.wins // Average win margin
      }));

    const bestAverageWinMargin = this.generateBestThreePodiumStat("Best Average win margin", averageWinMargins);
    const worstAverageWinMargin = this.generateWorstThreePodiumStat("Worst Average win margin", averageWinMargins);
    return [bestAverageWinMargin, worstAverageWinMargin];
  }

  private calculateDedicationRates(): PodiumResult[] {
    const totalPlaylists = this.playlistDataSubject.value.length;
    const attendanceCounts: Record<string, number> = {};

    // Step 1: Count the number of playlists each player participated in
    this.playlistDataSubject.value.forEach(playlist => {
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

    const mostDedicated = this.generateBestThreePodiumStat("Most Dedicated", attendanceRates);
    const leastDedicated = this.generateWorstThreePodiumStat("Least Dedicated", attendanceRates);
    return [mostDedicated, leastDedicated];
  }

  private calculateAverageScore(): PodiumResult[] {
    const playerStats: Record<string, { totalPoints: number; count: number }> = {};

    // Step 1: Accumulate points and count appearances
    this.playlistDataSubject.value.forEach(playlist => {
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
    const highestAveragePoints = this.generateBestThreePodiumStat("Highest Average Points", avgPointsArray);
    const lowestAveragePoints = this.generateWorstThreePodiumStat("Lowest Average Points", avgPointsArray);
    return [highestAveragePoints, lowestAveragePoints];
  }

  private generateBestThreePodiumStat(podiumTitle: string, players: Player[]): PodiumStat {
    return {
      title: podiumTitle,
      players: players.sort((a, b) => b.points - a.points).slice(0, 3)
    };
  }

  private generateWorstThreePodiumStat(podiumTitle: string, players: Player[]): PodiumStat {
    return {
      title: podiumTitle,
      players: players.sort((a, b) => a.points - b.points).slice(0, 3),
      isNegative: true
    };
  }

  private playlistWasDraw(playlist: Playlist): boolean {
    return playlist.players[0].points == playlist.players[1].points;
  }
}
