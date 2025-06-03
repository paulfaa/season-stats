import { Injectable } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { ChartResult, playerColors, Playlist, allNames } from '../models';
import { PlaylistDataService } from './playlist-data.service';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  private chartDataSubject = new BehaviorSubject<ChartResult[]>([]);
  public chartData$ = this.chartDataSubject.asObservable();
  private playlistData: Playlist[] = [];

  constructor(private playlistDataService: PlaylistDataService) {
    this.playlistDataService.playlistData$.subscribe(data => {
      this.playlistData = data;
    });
  }

  public generateAllCharts(): void {
    const charts = [];
    charts.push(this.generateTotalWinsChart());
    charts.push(this.generateTotalAppearancesChart());
    //charts.push(this.generateWinRateChart())
    this.chartDataSubject.next(charts);
  }

  public getAllCharts(): Observable<ChartResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      tap(() => this.generateAllCharts()),
      switchMap(() => this.chartData$)
    );
  }

  private generateTotalWinsChart(): ChartResult {
    const labels: string[] = [];
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
          title: {
            display: true,
            text: 'Total Wins'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            labelColor: (context) => this.getLabelColor(context),
          }
        }
      }
    };

    this.playlistData.forEach((playlist) => {
      const [year, month, day] = playlist.date.split('-'); // Split YYYY-MM-DD
      labels.push(`${day}-${month}`);

      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      var winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      //If draw, no one wins
      if (winners.length > 1) {
        winners = []
      }

      allNames.forEach(player => {
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
        borderColor: playerColors[player],
        backgroundColor: playerColors[player],
        fill: false
      }))
    };
    return {
      chartData: chart,
      chartOptions: totalWinsChartOptions,
      title: 'Total Wins'
    };
  }

  private generateTotalAppearancesChart(): ChartResult {
    const labels: string[] = [];
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
          },
          title: {
            display: true,
            text: 'Total Appearances'
          }
        }
      },
      plugins: {
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

    this.playlistData.forEach((playlist) => {
      const [year, month, day] = playlist.date.split('-'); // Split YYYY-MM-DD
      labels.push(`${day}-${month}`);

      playlist.players.forEach(player => {
        const name = player.name;
        if (!appearances[name]) {
          appearances[name] = [];
        }
        const currentAppearances = appearances[name][appearances[name].length - 1] || 0;
        appearances[name].push(currentAppearances + 1);
      });

      allNames.forEach(player => {
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
        borderColor: playerColors[player],
        backgroundColor: playerColors[player],
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

  private generateWinRateChart(): ChartResult {
    type PlayerWinStats = {
      winRate: number[];
      winCount: number;
      gamesPlayed: number;
    };

    const playerStats: Record<string, PlayerWinStats> = {};
    const labels: string[] = [];

    const winRateChartOptions: ChartOptions<'line'> = {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: {
            stepSize: 0.1,
            callback: (value) => `${(value as number * 100).toFixed(0)}%`
          },
          title: {
            display: true,
            text: 'Win Rate'
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

    this.playlistData.forEach((playlist, index) => {
      const [year, month, day] = playlist.date.split('-');
      labels.push(`${day}-${month}`);

      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      allNames.forEach(playerName => {
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

      allNames.forEach(name => {
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
        borderColor: playerColors[player],
        backgroundColor: playerColors[player],
        fill: false,
      }))
    };
    return {
      chartData: chart,
      chartOptions: winRateChartOptions,
      title: 'Win Rate Over Time'
    };
  }

  private getLabelColor(context: any): { borderColor: string; backgroundColor: string } {
    const label = context.dataset.label || '';
    const color = playerColors[label] || '#aaa';
    return {
      borderColor: color,
      backgroundColor: color
    };
  }


}
