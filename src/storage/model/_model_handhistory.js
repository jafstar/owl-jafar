export class HandHistory {
    id;
    deck;
    community;
    players;
    winners;

    constructor(id, deck, community, players, winners) {
        this.id = id == null ? 0 : id;
        this.deck = deck == null ? [] : deck;
        this.community = community == null ? [] : community;
        this.players = players == null ? [] : players;
        this.winners = winners == null ? [] : winners;
    }
}
