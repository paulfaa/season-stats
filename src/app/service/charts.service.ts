import { Injectable } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Observable, map } from 'rxjs';
import { ChartResult, RaceResults, PLAYER_COLOURS, ALL_NAMES, PlaylistData, PlaylistBreakdown } from '../models';
import { PlaylistDataService } from './playlist-data.service';
import { LeaderboardService } from './leaderboard.service';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  constructor(private playlistDataService: PlaylistDataService, private leaderboardService: LeaderboardService) {
  }

  public getAllCharts(): Observable<ChartResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      map(playlists => [
        this.generateTotalWinsChart(playlists),
        this.generateTotalAppearancesChart(playlists),
        this.generateWinRateChart(playlists)
      ])
    );
  }

  public getChampionshipPointsChart(): Observable<ChartResult> {
    const championshipPointsChartOptions: ChartOptions = {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        point: {
          radius: 0
        }
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: false
          },
          title: {
            display: true,
            text: 'Playlist Date'
          }
        },
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            labelColor: (context) => this.getLabelColor(context),
          }
        }
      }
    };

    return this.leaderboardService.getPlaylistBreakdown().pipe(
      map(breakdown => {
        const labels = breakdown.playlists.map(playlist => {
          const date = new Date(playlist.date);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          return `${day}-${month}`;
        });
        const playerStats = this.mapBreakdownToChartData(breakdown);
        const chart = {
          labels,
          datasets: Object.keys(playerStats).map(player => ({
            label: player,
            data: playerStats[player],
            borderColor: PLAYER_COLOURS[player],
            backgroundColor: PLAYER_COLOURS[player],
            fill: false
          }))
        };
        return {
          chartData: chart,
          chartOptions: championshipPointsChartOptions,
          title: 'Total Points'
        };
      })
    );
  }

  private generateTotalWinsChart(playlists: PlaylistData[]): ChartResult {
    const labels = this.generateDateLabels(playlists);
    const cumulativeWins: { [playerName: string]: number[] } = {};
    const totalWinsChartOptions: ChartOptions = {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        point: {
          radius: 0
        }
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: false
          },
          title: {
            display: true,
            text: 'Playlist Date'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            labelColor: (context) => this.getLabelColor(context),
          }
        }
      }
    };

    playlists.forEach((playlist) => {
      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      var winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      if (winners.length > 1) {
        winners = []
      }

      ALL_NAMES.forEach(player => {
        if (!cumulativeWins[player]) {
          cumulativeWins[player] = [];
        }
        const currentWins = cumulativeWins[player][cumulativeWins[player].length - 1] || 0;
        if (winners.some(w => w.name === player)) {
          cumulativeWins[player].push(currentWins + 1);
        }
        else {
          cumulativeWins[player].push(currentWins);
        }
      });
    });

    const chart = {
      labels,
      datasets: Object.keys(cumulativeWins).map(player => ({
        label: player,
        data: cumulativeWins[player],
        borderColor: PLAYER_COLOURS[player],
        backgroundColor: PLAYER_COLOURS[player],
        fill: false
      }))
    };
    return {
      chartData: chart,
      chartOptions: totalWinsChartOptions,
      title: 'Total Wins'
    };
  }

  private generateTotalAppearancesChart(playlists: PlaylistData[]): ChartResult {
    const labels = this.generateDateLabels(playlists);
    const appearances: { [playerName: string]: number[] } = {};
    const totalAppearancesChartOptions: ChartOptions = {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        point: {
          radius: 0
        }
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: false
          },
          title: {
            display: true,
            text: 'Playlist Date'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            labelColor: (context) => this.getLabelColor(context),
            label: function (context) {
              return context.parsed.y === 0 ? '' : `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      }
    };

    playlists.forEach((playlist) => {
      playlist.players.forEach(player => {
        const name = player.name;
        if (!appearances[name]) {
          appearances[name] = [];
        }
        const currentAppearances = appearances[name][appearances[name].length - 1] || 0;
        appearances[name].push(currentAppearances + 1);
      });

      ALL_NAMES.forEach(player => {
        if (!playlist.players.some(p => p.name === player)) {
          const currentAppearances = appearances[player]?.[appearances[player].length - 1] || 0;
          appearances[player] = appearances[player] || [];
          appearances[player].push(currentAppearances);
        }
      });
    });

    const chart = {
      labels,
      datasets: Object.keys(appearances).map(player => ({
        label: player,
        data: appearances[player],
        borderColor: PLAYER_COLOURS[player],
        backgroundColor: PLAYER_COLOURS[player],
        fill: false
      }))
    };
    return {
      chartData: chart,
      chartOptions: totalAppearancesChartOptions,
      title: 'Total Appearances'
    };
  }

  /*  private generateAverageFinishingPositionChart(): ChartResult {
 
     const playerStats: Record<string, { averagePosition: number[]; allPositions: number[]; appearances: number }> = {};
     const labels: string[] = [];
 
     this.playlistData.forEach((playlist) => {
       const [year, month, day] = playlist.date.split('-');
       labels.push(`${day}-${month}`);
 
     });
 
     this.allPlayers.forEach(playerName => {
       if (!(playerName in finishingPositions)) {
         finishingPositions[playerName] = {
           finishingPositions: [],
           gamesPlayed: 0
         };
       }
       const position = 
       finishingPositions[playerName].gamesPlayed += 1;
 
     });
   } */

  private mapBreakdownToChartData(breakdown: PlaylistBreakdown): Record<string, number[]> {
    const championshipPoints: Record<string, number[]> = {};
    breakdown.playlists.forEach(playlist => {
      playlist.results.forEach(player => {
        const name = player.playerName;
        if (!championshipPoints[name]) {
          championshipPoints[name] = [];
        }
        const points = championshipPoints[name][championshipPoints[name].length - 1] || 0;
        championshipPoints[name].push(points + player.championshipPoints);
      });
    });
    return championshipPoints;
  }

  private generateWinRateChart(playlists: PlaylistData[]): ChartResult {
    type PlayerWinStats = {
      winRate: number[];
      winCount: number;
      gamesPlayed: number;
    };

    const playerStats: Record<string, PlayerWinStats> = {};
    const labels = this.generateDateLabels(playlists);

    const winRateChartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
/*           min: 0,
          suggestedMax: 0.4, */
          ticks: {
            stepSize: 0.05,
            callback: (value) => `${(value as number * 100).toFixed(0)}%`
          }
        },
        x: {
          title: {
            display: true,
            text: 'Playlist Date'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            labelColor: (context) => this.getLabelColor(context),
            label: function (context) {
              return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
            }
          }
        }
      }
    };

    playlists.forEach((playlist, index) => {
      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      ALL_NAMES.forEach(playerName => {
        if (!(playerName in playerStats)) {
          playerStats[playerName] = {
            winRate: [],
            winCount: 0,
            gamesPlayed: 0
          };
        }

        playerStats[playerName].gamesPlayed += 1;

        if (winners.some(w => w.name === playerName)) {
          playerStats[playerName].winCount += 1;
        }

        const currentRate = playerStats[playerName].winCount / playerStats[playerName].gamesPlayed;
        playerStats[playerName].winRate.push(+currentRate.toFixed(2));
      });

      ALL_NAMES.forEach(name => {
        if (!playlist.players.some(p => p.name === name)) {
          const prev = playerStats[name].winRate[index - 1] ?? 0;
          playerStats[name].winRate.push(prev);
        }
      });
    });

    const chart = {
      labels,
      datasets: Object.keys(playerStats).map(player => ({
        label: player,
        data: playerStats[player].winRate,
        borderColor: PLAYER_COLOURS[player],
        backgroundColor: PLAYER_COLOURS[player],
        fill: false,
      }))
    };
    return {
      chartData: chart,
      chartOptions: winRateChartOptions,
      title: 'Win Rate'
    };
  }

  private generateDateLabels(playlists: PlaylistData[]): string[] {
    const labels: string[] = [];
    playlists.forEach((playlist) => {
      const [year, month, day] = playlist.playlistDate.split('-'); // Split YYYY-MM-DD
      labels.push(`${day}-${month}`);
    });
    return labels;
  }

  private getLabelColor(context: any): { borderColor: string; backgroundColor: string } {
    const label = context.dataset.label || '';
    const color = PLAYER_COLOURS[label] || '#aaa';
    return {
      borderColor: color,
      backgroundColor: color
    };
  }
}
