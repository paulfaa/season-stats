import { PLAYER_COLOURS, PlaylistData } from "../models";

export class Utils {

    static playlistWasDraw(playlist: PlaylistData): boolean {
        return playlist.players[0].totalPoints == playlist.players[1].totalPoints;
    }

    static toTwoDecimalPlaces(num: number): number {
        return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
    }

    static getCorrespondingColour(name: string): string {
        const colour = PLAYER_COLOURS[name];
        if(colour == undefined){
            return 'browm'
        }
        return colour;
    }
}