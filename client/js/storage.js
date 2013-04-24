
define(['lib/dinggit'], function() {

    var Storage = Class.extend({
        init: function() {
            this.resetData();
            this.initConnection();
        },

        initConnection: function(){
            DI.init({
                apiKey: '6f262109d5a3451d8513dcf2cd54e452', 
                status: true,
                cookie: true,
                logging: true
            });
        },

        onLogin: function(fn){
            DI.Event.subscribe('auth.login', function(response) {
                console.log("auth login"); 
                if(fn) fn();
            });
        },

        onStatusChange: function(fn){
            DI.Event.subscribe('auth.statusChange', function(response) {
                console.log("status change");
                if(fn) fn();
            });
        },

        onSessionChange: function(fn){
            DI.Event.subscribe('auth.sessionChange', function(response) {
               console.log("session change"); 
               if(fn) fn();
            });
        },

        getPlayerStatus: function(fn){
            var self = this;
            log.debug("Testing connection to DinggIt...");
            DI.getLoginStatus(function(response) {  
                if (response.status === 'connected') {     
                    log.debug("Connected to DinggIt."); 
                    // self.loadPlayer(); 
                    if(fn) fn(); 
                } else {
                    log.debug("Not connected to DinggIt! Response status: " + response.status);
                }
            });
        },

        connectPlayer: function(){
            var self = this;
            log.debug("Connecting to DinggIt...");
            DI.login(function(response) {        
                if (response.status == 'connected') {  
                    log.debug("Connected to DinggIt.");
                    self.loadPlayer();
                }else{
                    log.debug("Connection to DinggIt failed! Response status: " + response.status);
                }
            }, {        
                'display': 'popup'      
            });
        },

        loadPlayer: function(fn){
            var self = this;
            log.debug("Loading player...");
            DI.api('/action/load_player/run', function(response) {  
                if( response.status == 'success' && response.data.status == 'success'){
                    self.importData( response.data);
                    self.playerLoaded = true;        
                    log.debug("Player loaded.");
                    if(fn) fn();
                }else{
                    log.debug("Loading player failed! Response status: " + response.status);
                } 
            });
        },

        resetData: function() {
            this.playerLoaded = false;
            this.data = {
                hasAlreadyPlayed: false,
                player: {
                    name: "",
                    weapon: "",
                    armor: "",
                    guild: "",
                    image: ""
                },
                achievements: {
                    unlocked: [],
                    ratCount: 0,
                    skeletonCount: 0,
                    totalKills: 0,
                    totalDmg: 0,
                    totalRevives: 0
                }
            };
        },

        importData: function( dinggItData){
            var self = this;
            this.data = {
                hasAlreadyPlayed: false || dinggItData.player.dynProp.hasAlreadyPlayed,
                player: {
                    name: "" || dinggItData.player.name || dinggItData.player.dynProp.name,
                    weapon: "" || dinggItData.player.dynProp.weapon,
                    armor: "" || dinggItData.player.dynProp.armor,
                    guild: "" || dinggItData.player.dynProp.guild,
                    image: "" || dinggItData.player.dynProp.image
                },
                achievements: {
                    unlocked: [],
                    ratCount: 0,
                    skeletonCount: 0,
                    totalKills: 0,
                    totalDmg: 0,
                    totalRevives: 0
                }
            };

            _.each(dinggItData.achievements, function(element, index, list){
                if(element.dynProp.unlocked == true){
                    self.data.achievements.unlocked.push(parseInt(element.ref));
                }

                switch(element.ref){
                    case "3":
                        self.data.achievements.ratCount = element.dynProp.progression;
                    break;
                    case "10":
                        self.data.achievements.skeletonCount = element.dynProp.progression;
                    break;
                    case "13":
                        self.data.achievements.totalKills = element.dynProp.progression;
                    break;
                    case "14":
                        self.data.achievements.totalRevives = element.dynProp.progression;
                    break;
                    case "15":
                        self.data.achievements.totalDmg = element.dynProp.progression;
                    break;
                }
            });
        },

        exportData: function(){
            var self = this;

            var data = {
                hasAlreadyPlayed: self.data.hasAlreadyPlayed,
                name: self.data.player.name,
                weapon: self.data.player.weapon,
                armor: self.data.player.armor,
                guild: self.data.player.guild,
                image: self.data.player.image,
                p3: self.data.achievements.ratCount,
                p10: self.data.achievements.skeletonCount,
                p13: self.data.achievements.totalKills,
                p14: self.data.achievements.totalRevives,
                p15: self.data.achievements.totalDmg
                
            };

            _.each( [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 16, 17, 18, 19, 20], function(element, index, list){
                if(_.contains( self.data.achievements.unlocked, element)){
                    data["p" + element] = 1;
                }else{
                    data["p" + element] = 0;
                }
            });
            
            return data;
        },

        save: function() {
            var req = this.exportData();
            log.debug("Saving player");
            DI.api('/action/save_player/run', 
                'POST', 
                req,
                function(response) {
                    if (response.status == 'success' && response.data.status == 'success') {
                        log.debug("Player saved.");
                    } else {
                        log.debug("Saving player failed! Response status: " + response.status);
                    }
                }
            );
        },

        clear: function() {
            this.resetData();
            this.save();
        },

        // Player

        isPlayerLoaded: function(){
            return this.playerLoaded;
        },

        hasAlreadyPlayed: function() {
            return this.data.hasAlreadyPlayed;
        },

        initPlayer: function(name) {
            this.data.hasAlreadyPlayed = true;
            this.setPlayerName(name);
        },

        setPlayerName: function(name) {
            this.data.player.name = name;
            this.save();
        },

        setPlayerImage: function(img) {
            this.data.player.image = img;
            this.save();
        },

        setPlayerArmor: function(armor) {
            this.data.player.armor = armor;
            this.save();
        },

        setPlayerWeapon: function(weapon) {
            this.data.player.weapon = weapon;
            this.save();
        },
        
        setPlayerGuild: function(guild) {
			if(typeof guild !== "undefined") {
				this.data.player.guild={id:guild.id, name:guild.name,members:JSON.stringify(guild.members)};
				this.save();
			}
			else{
				delete this.data.player.guild;
				this.save();
			}
		},

        savePlayer: function(img, armor, weapon, guild) {
            this.setPlayerImage(img);
            this.setPlayerArmor(armor);
            this.setPlayerWeapon(weapon);
            this.setPlayerGuild(guild);
        },

        // Achievements

        hasUnlockedAchievement: function(id) {
            return _.include(this.data.achievements.unlocked, id);
        },

        unlockAchievement: function(id) {
            if(!this.hasUnlockedAchievement(id)) {
                this.data.achievements.unlocked.push(id);
                this.save();
                return true;
            }
            return false;
        },

        getAchievementCount: function() {
            return _.size(this.data.achievements.unlocked);
        },

        // Angry rats
        getRatCount: function() {
            return this.data.achievements.ratCount;
        },

        incrementRatCount: function() {
            if(this.data.achievements.ratCount < 10) {
                this.data.achievements.ratCount++;
                this.save();
            }
        },

        // Skull Collector
        getSkeletonCount: function() {
            return this.data.achievements.skeletonCount;
        },

        incrementSkeletonCount: function() {
            if(this.data.achievements.skeletonCount < 10) {
                this.data.achievements.skeletonCount++;
                this.save();
            }
        },

        // Meatshield
        getTotalDamageTaken: function() {
            return this.data.achievements.totalDmg;
        },

        addDamage: function(damage) {
            if(this.data.achievements.totalDmg < 5000) {
                this.data.achievements.totalDmg += damage;
                this.save();
            }
        },

        // Hunter
        getTotalKills: function() {
            return this.data.achievements.totalKills;
        },

        incrementTotalKills: function() {
            if(this.data.achievements.totalKills < 50) {
                this.data.achievements.totalKills++;
                this.save();
            }
        },

        // Still Alive
        getTotalRevives: function() {
            return this.data.achievements.totalRevives;
        },

        incrementRevives: function() {
            if(this.data.achievements.totalRevives < 5) {
                this.data.achievements.totalRevives++;
                this.save();
            }
        },
    });

    return Storage;
});
