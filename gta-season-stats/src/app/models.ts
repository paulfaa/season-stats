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