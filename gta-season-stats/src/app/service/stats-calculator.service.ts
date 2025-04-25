import { Injectable } from '@angular/core';
import { IndividualResult, Player, Playlist, PodiumResult, PodiumResult as PodiumStat } from '../models';
import { GoogleSheetsService } from './google-sheets.service';
import { BehaviorSubject, filter, Observable, switchMap, tap } from 'rxjs';

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
        this.updateAllGroupStats();
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
    stats.push(this.calculateMostDraws());
    stats.push(this.calculateAverageLossMargins())
    const mostPlaylistsLost = this.calculateMostPlaylistsLostInFinalEvent();
    mostPlaylistsLost != null && stats.push(mostPlaylistsLost);

    //methods returning multiple stats
    stats.push(...this.calculateWinRatios());
    stats.push(...this.calculateAverageFinishingPositions());
    stats.push(...this.calculateAverageScore());
    stats.push(...this.calculateAverageWinMargins());
    stats.push(...this.calculateDedicationRates());
    this.podiumDataSubject.next(stats)
  }

  private toTwoDecimalPlaces(num: number): number {
    return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
  }

  private calculateTotalNumberOfPlaylists(): IndividualResult {
    return { title: 'Total Playlists', value: this.playlistDataSubject.value.length }
  }

  private calculateAveragePlaylistLength(): IndividualResult {
    const avgLength = this.playlistDataSubject.value.reduce((acc, playlist) => acc + playlist.length, 0) / this.playlistDataSubject.value.length;
    return { title: 'Average Playlist Length', value: this.toTwoDecimalPlaces(avgLength) }
  }

  private calculateAverageSquadSize(): IndividualResult {
    const avgSize = this.playlistDataSubject.value.reduce((acc, playlist) => acc + playlist.players.length, 0) / this.playlistDataSubject.value.length;
    return { title: 'Average Squad Size', value: this.toTwoDecimalPlaces(avgSize) }
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

  private calculateMostPlaylistsLostInFinalEvent(): PodiumResult | undefined {
    const lossCounts: Record<string, number> = {};
    this.playlistDataSubject.value.forEach(playlist => {
      const pointsAvailable: number[] = [];
      var resultsInLastEvent: Player[] = [];
      playlist.players.forEach(player => {
        const scoreInSecondLastEvent = player.totalPoints - player.lastEventPoints!;
        if (player.lastEventPoints! > 1) {
          pointsAvailable.push(player.lastEventPoints!)
        }
        resultsInLastEvent.push({ name: player.name, totalPoints: scoreInSecondLastEvent })
      });
      resultsInLastEvent.sort((a, b) => b.totalPoints - a.totalPoints);

      const winners = [];
      if (resultsInLastEvent[0].totalPoints == resultsInLastEvent[1].totalPoints) {
        winners.push(resultsInLastEvent[0]);
        winners.push(resultsInLastEvent[1]);
      }
      else {
        winners.push(resultsInLastEvent[0]);
      }

      const maxPointsAvailable = Math.max(...pointsAvailable);
      const minPointsAvailable = Math.min(...pointsAvailable);
      const winner = playlist.players[0];
      const pointsToBeat = winner.totalPoints - maxPointsAvailable + minPointsAvailable;

      winners.forEach(player => {
        if (winner.name == resultsInLastEvent[0].name) {
          return;
        }
        if (player.totalPoints + maxPointsAvailable >= pointsToBeat) {
          lossCounts[player.name] = (lossCounts[player.name] || 0) + 1;
        }
      })
    });

    const sortedPlayers = this.sortHighestToLowest(lossCounts)
    if (sortedPlayers.length > 0) {
      const result = this.generateTopThreePodium("Most playlists lost in final event", sortedPlayers);
      result.isNegative = true;
      return result;
    }
    else {
      return undefined;
    }
  }

  private calculateMostWins(): PodiumResult {
    const winCounts: Record<string, number> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      var winners = [];
      if (this.playlistWasDraw(playlist)) {
        return;
      }
      else {
        winners.push(playlist.players[0]);
      }
      winners.forEach(winner => {
        winCounts[winner.name] = (winCounts[winner.name] || 0) + 1;
      });
    });

    const sortedPlayers = this.sortHighestToLowest(winCounts)
    return this.generateTopThreePodium("Most Wins", sortedPlayers);
  }

  private calculateMostSecondPlaces(): PodiumResult {
    const secondPlaceCounts: Record<string, number> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      var secondPlacePlayer;
      if (this.playlistWasDraw(playlist)) {
        secondPlacePlayer = playlist.players[2];
      }
      else {
        secondPlacePlayer = playlist.players[1];
      }
      secondPlaceCounts[secondPlacePlayer.name] = (secondPlaceCounts[secondPlacePlayer.name] || 0) + 1;
    });

    const sortedPlayers = this.sortHighestToLowest(secondPlaceCounts);
    return this.generateTopThreePodium("Most Second Place Finishes", sortedPlayers);
  }

  private calculateMostLastPlaces(): PodiumResult {
    const lastPlaceCounts: Record<string, number> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      const lastPlayer = playlist.players[playlist.players.length - 1];
      lastPlaceCounts[lastPlayer.name] = (lastPlaceCounts[lastPlayer.name] || 0) + 1;
    });

    const sortedPlayers = this.sortHighestToLowest(lastPlaceCounts);

    const result = this.generateTopThreePodium("Most Last Place Finishes", sortedPlayers);
    result.isNegative = true;
    return result;
  }

  private calculateMostDraws(): PodiumResult {
    const drawCounts: Record<string, number> = {};
    this.playlistDataSubject.value.forEach(playlist => {
      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);
      if (winners.length > 1) {
        winners.forEach(winner => {
          drawCounts[winner.name] = (drawCounts[winner.name] || 0) + 1;
        });
      }
    })
    const sortedPlayers = this.sortHighestToLowest(drawCounts);
    const result = this.generateTopThreePodium("Most Draws", sortedPlayers);
    result.isNegative = true;
    return result;
  }

  private calculateWinRatios(): PodiumResult[] {
    const winsAndAppearances: Record<string, { wins: number; appearances: number }> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
        return
      }

      const winner = playlist.players[0];
      playlist.players.forEach(player => {
        if (!winsAndAppearances[player.name]) {
          winsAndAppearances[player.name] = { wins: 0, appearances: 0 };
        }
        winsAndAppearances[player.name].appearances += 1;
      });

      winsAndAppearances[winner.name].wins += 1;
    });

    const winRatios = Object.entries(winsAndAppearances)
      .map(([name, stats]) => ({
        name,
        totalPoints: (stats.wins / stats.appearances) * 100
      }));

    const highestWinRatio = this.generateTopThreePodium("Highest Win Ratio", winRatios);
    const lowestWinRatio = this.generateBottomThreePodium("Lowest Win Ratio", winRatios);
    return [highestWinRatio, lowestWinRatio];
  }

  private calculateAverageFinishingPositions(): PodiumResult[] {
    const playerStats: Record<string, { totalPosition: number; appearances: number }> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      playlist.players.forEach((player, index) => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = { totalPosition: 0, appearances: 0 };
        }
        playerStats[player.name].totalPosition += (index + 1);
        playerStats[player.name].appearances += 1;
      });
    });

    const averagePositions = Object.entries(playerStats)
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalPosition / stats.appearances
      }));

    //The lower the average the better  
    const bestAveragePositions = this.generateBottomThreePodium("Best Average Finishing Position", averagePositions, true);
    bestAveragePositions.isNegative = false;
    const worstAveragePositions = this.generateTopThreePodium("Worst Average Finishing Position", averagePositions);
    worstAveragePositions.isNegative = true;
    return [bestAveragePositions, worstAveragePositions];
  }

  private calculateAverageWinMargins(): PodiumResult[] {
    const totalWinMargins: Record<string, { totalWinMargin: number; wins: number }> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      if (this.playlistWasDraw(playlist)) {
        return
      }
      const winner = playlist.players[0];
      const winMargin = winner.totalPoints - playlist.players[1].totalPoints;

      if (!totalWinMargins[winner.name]) {
        totalWinMargins[winner.name] = { totalWinMargin: 0, wins: 0 };
      }
      totalWinMargins[winner.name].totalWinMargin += winMargin;
      totalWinMargins[winner.name].wins += 1;
    });

    const averageWinMargins = Object.entries(totalWinMargins)
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalWinMargin / stats.wins
      }));

    const bestAverageWinMargin = this.generateTopThreePodium("Best Average Win Margin", averageWinMargins);
    const worstAverageWinMargin = this.generateBottomThreePodium("Worst Average Win Margin", averageWinMargins);
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
    const result = this.generateTopThreePodium("Average Loss Margin", averageLossMargins);
    result.isNegative = true;
    return result;
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
        totalPoints: (count / totalPlaylists) * 100
      }));

    const mostDedicated = this.generateTopThreePodium("Most Dedicated", attendanceRates);
    const leastDedicated = this.generateBottomThreePodium("Least Dedicated", attendanceRates);
    return [mostDedicated, leastDedicated];
  }

  private calculateAverageScore(): PodiumResult[] {
    const playerStats: Record<string, { totalPoints: number; count: number }> = {};

    this.playlistDataSubject.value.forEach(playlist => {
      playlist.players.forEach(player => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = { totalPoints: 0, count: 0 };
        }
        playerStats[player.name].totalPoints += player.totalPoints;
        playerStats[player.name].count += 1;
      });
    });

    const avgPointsArray = Object.entries(playerStats).map(([name, stats]) => ({
      name,
      totalPoints: stats.totalPoints / stats.count  // Compute average
    }));
    const highestAveragePoints = this.generateTopThreePodium("Highest Average Points", avgPointsArray);
    const lowestAveragePoints = this.generateBottomThreePodium("Lowest Average Points", avgPointsArray);
    return [highestAveragePoints, lowestAveragePoints];
  }

  private sortHighestToLowest(stats: Record<string, number>) {
    return Object.entries(stats)
      .map(([name, count]) => ({ name, totalPoints: count }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }

  private generateTopThreePodium(podiumTitle: string, players: Player[], invertOrder?: boolean): PodiumStat {
    return {
      title: podiumTitle,
      players: players
        .map(player => ({
          ...player,
          totalPoints: Number.isInteger(player.totalPoints)
            ? player.totalPoints
            : parseFloat(player.totalPoints.toFixed(2))
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 3),
      invertOrder: invertOrder
    };
  }

  private generateBottomThreePodium(podiumTitle: string, players: Player[], invertOrder?: boolean): PodiumStat {
    return {
      title: podiumTitle,
      players: players
        .map(player => ({
          ...player,
          totalPoints: Number.isInteger(player.totalPoints)
            ? player.totalPoints
            : parseFloat(player.totalPoints.toFixed(2))
        }))
        .sort((a, b) => a.totalPoints - b.totalPoints)
        .slice(0, 3),
      invertOrder: invertOrder,
      isNegative: true
    };
  }

  private playlistWasDraw(playlist: Playlist): boolean {
    return playlist.players[0].totalPoints == playlist.players[1].totalPoints;
  }
}
