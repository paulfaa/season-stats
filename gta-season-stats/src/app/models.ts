import { ChartData, ChartOptions } from "chart.js";

export interface Player {
    name: string;
    totalPoints: number;
    pointsInSecondLastRace?: number;
}
  
export interface Playlist {
    name: string;
    date: string;
    length: number;
    players: Player[];
}

export interface PodiumResult {
    title: string;
    players: Player[];
    isNegative?: boolean;
    invertOrder?: boolean;
}

export interface IndividualResult {
    title: string;
    subtitle?: string;
    player?: Player;
    value?: number;
}

export interface ChartResult {
    chartData: ChartData;
    chartOptions: ChartOptions;
    title: string;
}