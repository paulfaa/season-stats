import { ChartData, ChartOptions } from "chart.js";

export interface Player {
    name: string;
    totalPoints: number;
    lastEventPoints?: number;
}

export interface Playlist {
    name: string;
    date: string;
    length: number;
    players: Player[];
}

export interface PodiumResult {
    title: string;
    subtitle?: string;
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

export interface PlayerResult {
    playerName: string;
    points: number;
}

export interface RaceResult {
    date: Date;
    players: PlayerResult[];
}

export interface RaceResults {
    races: RaceResult[];
}

export const allNames = ['BarizztaButzy', 'mikc95', 'meas_taibhse', 'iiCiaran', 'cooooney95', 'kendy232', 'hurling1', 'jackw2610', 'galwayboy7'];

export const playerColors: { [name: string]: string } = {
    'BarizztaButzy': 'rgb(173, 10, 202)',
    'mikc95': 'rgb(234, 234, 4)',
    'meas_taibhse': 'rgb(231, 228, 229)',
    'iiCiaran': 'rgb(238, 31, 52)',
    'cooooney95': 'rgb(255, 86, 218)',
    'kendy232': 'rgb(17, 229, 45)',
    'hurling1': 'rgb(249, 151, 5)',
    'jackw2610': 'rgb(0, 0, 0)',
    'galwayboy7': 'rgb(20, 192, 245)',
};
