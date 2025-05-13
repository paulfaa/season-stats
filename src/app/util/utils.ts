import { playerColors, Playlist } from "../models";

export class Utils {

    static playlistWasDraw(playlist: Playlist): boolean {
        return playlist.players[0].totalPoints == playlist.players[1].totalPoints;
    }

    static toTwoDecimalPlaces(num: number): number {
        return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
    }

    static getCorrespondingColour(name: string): string {
        const colour = playerColors[name];
        if(colour == undefined){
            return 'browm'
        }
        return colour;
    }
}