import { PLAYER_COLOURS, PlaylistData } from "../models";

export class Utils {

    static pointsMap = new Map<number, number>([
        [0, 25],
        [1, 18],
        [2, 15],
        [3, 12],
        [4, 10],
        [5, 8],
        [6, 6],
        [7, 4]
    ])

    static calculateChampionshipPoints(finishingPosition: number) {
        return Utils.pointsMap.get(finishingPosition) || 0;
    }

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