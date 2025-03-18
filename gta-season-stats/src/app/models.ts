export interface Player {
    name: string;
    points: number;
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
}

export interface IndividualResult {
    title: string;
    subtitle?: string;
    player?: Player;
    value?: number;
}