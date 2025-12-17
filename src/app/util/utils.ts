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

    static calculateChampionshipPointsByPlayer(
        players: { name: string; totalPoints: number }[]
    ): Record<string, number> {

        const sorted = [...players].sort(
            (a, b) => b.totalPoints - a.totalPoints
        );

        const result: Record<string, number> = {};

        let currentRank = 1;
        let previousPoints: number | null = null;

        sorted.forEach(player => {
            if (previousPoints !== null && player.totalPoints < previousPoints) {
                currentRank += 1;
            }

            result[player.name] = Utils.pointsMap.get(currentRank - 1) || 0;
            previousPoints = player.totalPoints;
        });

        return result;
    }

    static playlistWasDraw(playlist: PlaylistData): boolean {
        return playlist.players[0].totalPoints == playlist.players[1].totalPoints;
    }

    static toTwoDecimalPlaces(num: number): number {
        return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
    }

    static getCorrespondingColour(name: string): string {
        const colour = PLAYER_COLOURS[name];
        if (colour == undefined) {
            return 'browm'
        }
        return colour;
    }

    static dateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
}