import { Injectable } from '@angular/core';
import { IndividualResult, Player, Playlist, PodiumResult, PodiumResult as PodiumStat } from '../models';
import { GoogleSheetsService } from './google-sheets.service';
import { BehaviorSubject, filter, Observable, switchMap, tap } from 'rxjs';
import { ChartData } from 'chart.js';

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
  private chartDataSubject = new BehaviorSubject<ChartData[]>([]);
  public chartData$ = this.chartDataSubject.asObservable();

  constructor(private googleSheetsService: GoogleSheetsService) {
    this.fetchPlaylistData();
  }

  private fetchPlaylistData(): void {
    this.googleSheetsService.fetchSheetsPlaylistData().subscribe({
      next: (data) => {
        this.playlistDataSubject.next(data);
        this.updateAllIndividualStats();
        this.updateAllGroupStats();
        this.updateAllCharts();
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

  private generateTotalWinsChart(): ChartData<'line'> {
    const labels: string[] = [];
    const wins: { [playerName: string]: number[] } = {};
    const cumulativeWins: { [playerName: string]: number } = {};

    this.playlistDataSubject.value.forEach((playlist) => {
      const [year, month, day] = playlist.date.split('-'); // Split YYYY-MM-DD
      labels.push(`${day}-${month}-${year}`);

      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      winners.forEach(winner => {
        if (!cumulativeWins[winner.name]) {
          cumulativeWins[winner.name] = 0;
          wins[winner.name] = [];
        }
        cumulativeWins[winner.name]++;
      });

      Object.keys(cumulativeWins).forEach(player => {
        wins[player] = wins[player] || [];
        wins[player].push(cumulativeWins[player]);
      });
    });

    var chart = {
      labels,
      datasets: Object.keys(wins).map(player => ({
        label: player,
        data: wins[player],
        borderColor: this.getRandomColor(),
        backgroundColor: this.getRandomColor(0.3),
        fill: false,
      }))
    };
    return chart;
  }

  private generateWinRateChart(): ChartData<'line'> {
    const labels: string[] = [];
    const winRates: { [playerName: string]: number[] } = {};
    this.playlistDataSubject.value.forEach((playlist) => {
      const [year, month, day] = playlist.date.split('-'); // Split YYYY-MM-DD
      labels.push(`${day}-${month}-${year}`);
    });
    var chart = {
      labels,
      datasets: Object.keys(winRates).map(player => ({
        label: player,
        data: winRates[player],
        borderColor: this.getRandomColor(),
        backgroundColor: this.getRandomColor(0.3),
        fill: false,
      }))
    };
    return chart;
  }

  private getRandomColor(opacity: number = 1): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
    stats.push(this.calculateAverageLossMargins())

    //methods returning multiple stats
    stats.push(...this.calculateWinRatios());
    stats.push(...this.calculateAverageFinishingPositions());
    stats.push(...this.calculateAverageScore());
    stats.push(...this.calculateAverageWinMargins());
    stats.push(...this.calculateDedicationRates());
    this.podiumDataSubject.next(stats)
  }

  public updateAllCharts(): void {
    const charts = [];
    charts.push(this.generateTotalWinsChart());
    this.chartDataSubject.next(charts);
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

  /* private calculateMostPlaylistsLostInFinalRace(): PodiumResult {
    const lossCounts: Record<string, number> = {};
    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
        return
      }
      const maxPointsAvailable = playlist.players[0].totalPoints;
      const minPointsAvailable = playlist.players[playlist.players.length - 1].totalPoints;

      const winner = playlist.players[0];
      
    }
  } */

  private calculateMostWins(): PodiumResult {
    const winCounts: Record<string, number> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      var winners = [];
      if(this.playlistWasDraw(playlist)){
        winners.push(playlist.players[0]);
        winners.push(playlist.players[1]);
      }
      else{
        winners.push(playlist.players[0]);
      }
      winners.forEach(winner => {
        winCounts[winner.name] = (winCounts[winner.name] || 0) + 1;
      });
    });

    const sortedPlayers = Object.entries(winCounts)
      .map(([name, count]) => ({ name, totalPoints: count }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return this.generateBestThreePodiumStat("Most Wins", sortedPlayers);
  }

  private calculateMostSecondPlaces(): PodiumResult {
    const secondPlaceCounts: Record<string, number> = {};

    // Step 1: Count second-place finishes
    this.playlistDataSubject.value.forEach(playlist => {
      var secondPlacePlayer;
      if(this.playlistWasDraw(playlist)){
        secondPlacePlayer = playlist.players[2];
      }
      else{
        secondPlacePlayer = playlist.players[1];
      }
      secondPlaceCounts[secondPlacePlayer.name] = (secondPlaceCounts[secondPlacePlayer.name] || 0) + 1;
    });

    // Step 2: Convert map to an array and sort it by count (descending)
    const sortedPlayers = Object.entries(secondPlaceCounts)
      .map(([name, count]) => ({ name, totalPoints: count })) // 'points' represents second-place finishes
      .sort((a, b) => b.totalPoints - a.totalPoints);

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
      .map(([name, count]) => ({ name, totalPoints: count }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const result = this.generateBestThreePodiumStat("Most Last Place Finishes", sortedPlayers);
    result.isNegative = true;
    return result;
  }

  private calculateWinRatios(): PodiumResult[] {
    const playerStats: Record<string, { wins: number; appearances: number }> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
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
        totalPoints: (stats.wins / stats.appearances) * 100 // Convert to percentage
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
        totalPoints: stats.totalPosition / stats.appearances // Lower is better
      }));

    const bestAveragePositions = {
      title: "Best Average Finishing Position",
      players: averagePositions.sort((a, b) => a.totalPoints - b.totalPoints),
      invertOrder: false
    };

    const worstAveragePositions = this.generateWorstThreePodiumStat("Worst Average Finishing Position", averagePositions, true);
    return [bestAveragePositions, worstAveragePositions];
  }

  private calculateAverageWinMargins(): PodiumResult[] {
    const playerStats: Record<string, { totalMargin: number; wins: number }> = {};

    // Step 1: Calculate win margins for each winner
    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
        return
      }
      const winner = playlist.players[0];
      const winMargin = winner.totalPoints - playlist.players[1].totalPoints;

      if (!playerStats[winner.name]) {
        playerStats[winner.name] = { totalMargin: 0, wins: 0 };
      }
      playerStats[winner.name].totalMargin += winMargin;
      playerStats[winner.name].wins += 1;
    });

    const averageWinMargins = Object.entries(playerStats)
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalMargin / stats.wins // Average win margin
      }));

    const bestAverageWinMargin = this.generateBestThreePodiumStat("Best Average win margin", averageWinMargins);
    const worstAverageWinMargin = this.generateWorstThreePodiumStat("Worst Average win margin", averageWinMargins, true);
    return [bestAverageWinMargin, worstAverageWinMargin];
  }

  private calculateAverageLossMargins(): PodiumResult {
    const totalLossMargins: Record<string, { totalLossMargin: number; appearances: number }> = {};
    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
        return
      }
      const winningPoints = playlist.players[0].totalPoints;
      for (var x = 1; x < playlist.players.length - 1; x++) {
        const player = playlist.players[x];
        const lossMargin = winningPoints - player.totalPoints;
        if (!totalLossMargins[player.name]) {
          totalLossMargins[player.name] = { totalLossMargin: 0, appearances: 0 };
        }
        totalLossMargins[player.name].totalLossMargin += lossMargin;
        totalLossMargins[player.name].appearances += 1;
      }
    });
    const averageLossMargins = Object.entries(totalLossMargins)
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalLossMargin / stats.appearances
      }));
    return this.generateWorstThreePodiumStat("Average Loss Margin", averageLossMargins)
  }

  private calculateDedicationRates(): PodiumResult[] {
    const totalPlaylists = this.playlistDataSubject.value.length;
    const attendanceCounts: Record<string, number> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      playlist.players.forEach(player => {
        attendanceCounts[player.name] = (attendanceCounts[player.name] || 0) + 1;
      });
    });

    const attendanceRates = Object.entries(attendanceCounts)
      .map(([name, count]) => ({
        name,
        totalPoints: (count / totalPlaylists) * 100  // Convert to percentage
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
        playerStats[player.name].totalPoints += player.totalPoints;
        playerStats[player.name].count += 1;
      });
    });

    // Step 2: Calculate average points per playlist
    const avgPointsArray = Object.entries(playerStats).map(([name, stats]) => ({
      name,
      totalPoints: stats.totalPoints / stats.count  // Compute average
    }));
    const highestAveragePoints = this.generateBestThreePodiumStat("Highest Average Points", avgPointsArray);
    const lowestAveragePoints = this.generateWorstThreePodiumStat("Lowest Average Points", avgPointsArray, true);
    return [highestAveragePoints, lowestAveragePoints];
  }

  private generateBestThreePodiumStat(podiumTitle: string, players: Player[], invertOrder?: boolean): PodiumStat {
    return {
      title: podiumTitle,
      players: players.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3),
      invertOrder: invertOrder
    };
  }

  private generateWorstThreePodiumStat(podiumTitle: string, players: Player[], invertOrder?: boolean): PodiumStat {
    return {
      title: podiumTitle,
      players: players.sort((a, b) => a.totalPoints - b.totalPoints).slice(0, 3),
      isNegative: true,
      invertOrder: invertOrder
    };
  }

  private playlistWasDraw(playlist: Playlist): boolean {
    return playlist.players[0].totalPoints == playlist.players[1].totalPoints;
  }
}
