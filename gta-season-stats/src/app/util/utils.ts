import { Playlist } from "../models";

export class Utils {

    static playlistWasDraw(playlist: Playlist): boolean {
        return playlist.players[0].totalPoints == playlist.players[1].totalPoints;
    }

    static toTwoDecimalPlaces(num: number): number {
        return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
    }
}