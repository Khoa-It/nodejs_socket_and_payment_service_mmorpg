class GameServer {
    constructor(parameters) {
        this.playerId = [];   
    }

    getPlayerId() {
        return this.playerId;
    }

    addPlayer(param){
        this.playerId=this.playerId.filter(item => item.user_id != param.user_id);
        this.playerId.push(param);
    }
}

module.exports = {
    GameServer,
}