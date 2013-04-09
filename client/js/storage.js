
define(['lib/dinggit', 'connect'], function() {

    // store: null;
    var Storage = Class.extend({
        init: function() {

            this.resetData();
            // this.playerLoaded = false;
            // this.store = this;

            if(DI._userStatus == 'connected'){
                log.debug("Storage connected.");
                this.loadPlayer();
            }

            // if(this.hasLocalStorage() && localStorage.data) {
            //     this.data = JSON.parse(localStorage.data);
            // } else {
            //     this.resetData();
            // }
        },

        login: function(){
            var self = this;
            DI.login(function(response) {        
                if (response.status == 'connected') {  
                    self.loadPlayer();
                    log.debug("Storage connected.");
                }      
            }, {        
                'display': 'popup'      
            });
        },

        loadPlayer: function(){
            log.debug("Loading player...");
            var self = this;
            DI.api('/action/load_player/run', function(response) {  
                if( response.status == 'success' && response.data.status == 'success'){
                    
                    //load player info
                    self.data = response.data;
                    self.playerLoaded = true;        
                    log.debug("Player loaded.");
                    // self.fireLoadPlayerHandlers();
                }   
            });
        },

        // onLoadPlayerHandlers: [],
        // onLoadPlayer: function(handler){
        //     this.onLoadPlayerHandlers.push(handler);
        // },

        // fireLoadPlayerHandlers: function(){
        //     for (var i = 0; i < this.onLoadPlayerHandlers.length; i++) {
        //         this.onLoadPlayerHandlers[i]();
        //     };
        // },

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

        // hasLocalStorage: function() {
        //     return Modernizr.localstorage;
        // },

        isPlayerLoaded: function(){
            return this.playerLoaded;
        },

        save: function() {
            if(this.hasLocalStorage()) {
                localStorage.data = JSON.stringify(this.data);
            }
        },

        clear: function() {
            if(this.hasLocalStorage()) {
                localStorage.data = "";
                this.resetData();
            }
        },

        // Player

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
