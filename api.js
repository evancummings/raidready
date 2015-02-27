var totalMembers;
var parseProgress;

var ApiManager = {
    GuildEndPoint: function(region, realm, guild) {
        return "http://" + region + ".battle.net/api/wow/guild/" + realm + "/" + guild + "?fields=members&jsonp=ApiManager.ParseGuildMembers";
    },
    CharacterEndPoint: function(region, realm, character) {
        //return "http://" + region + ".battle.net/api/wow/character/" + realm + "/Raxas?fields=items,progression,stats,talents&jsonp=ApiManager.ParseCharacter";
        return "http://" + region + ".battle.net/api/wow/character/" + realm + "/" + character + "?fields=items,progression,stats,talents&jsonp=ApiManager.ParseCharacter";
    },
    GetGuildMembers: function (region, realm, guild) {
        ApiManager.ShowLoader();
        var endPoint  = ApiManager.GuildEndPoint(region, realm, guild);
        $.ajax({
            url: endPoint,
            type: "GET",
            dataType: "jsonp"
        });
    },
    GetCharacter: function(region,  realm, character) {
        var endPoint  = ApiManager.CharacterEndPoint(region, realm, character);
        $.ajax({
            url: endPoint,
            type: "GET",
            dataType: "jsonp"
        });
    },
    ParseGuildMembers: function(data) {
        $("#raid-table tbody").html("");
        var results = _.filter(data.members, function(member) {
            return member.character.level == 100;
        });

        totalMembers = results.length;
        parseProgress = 0;

        ApiManager.UpdateProgressBar(parseProgress, totalMembers);

        $.each(results, function(index) {
            var name = results[index].character.name;
            
            
            ApiManager.GetCharacter($("#region").val(), results[index].character.realm, name);
        });
    },
    ParseCharacter: function(data) {
      console.log(data);
        parseProgress += 1;
        ApiManager.UpdateProgressBar(parseProgress, totalMembers);
        // Basic Info //////////////////////////////////////////////////////////
        var characterData = {};
        characterData.Name = data.name;
        characterData.Class = data.class;
        characterData.Spec = _.find(data.talents, function(talent){ return talent.selected == true; });

        // Items ///////////////////////////////////////////////////////////////
        characterData.Items = data.items;

        // Stats

        // Progression ////////////////////////////////////////////////////////

          // Highmaul (ID: 6996)
          var highmaulNormalKills = 0;
          var highmaulHeroicKills = 0;
          var highmaulMythicKills = 0;

          var highmaulData = _.find(data.progression.raids, function(raid) { return raid.id == 6996; });

          if (highmaulData) {
            highmaulNormalKills = _.reduce(highmaulData.bosses, function(count, boss) {return count + boss.normalKills; }, 0);
            highmaulHeroicKills = _.reduce(highmaulData.bosses, function(count, boss) {return count + boss.heroicKills; }, 0);
            highmaulMythicKills = _.reduce(highmaulData.bosses, function(count, boss) {return count + boss.mythicKills; }, 0);
          }

          // Blackrock Foundry (ID: 6967)

          var blackrockNormalKills = 0;
          var blackrockHeroicKills = 0;
          var blackrockMythicKills = 0;

          var blackrockData = _.find(data.progression.raids, function(raid) { return raid.id == 6967 });

          if (blackrockData) {
            blackrockNormalKills = _.reduce(blackrockData.bosses, function(count, boss) {return count + boss.normalKills; }, 0);
            blackrockHeroicKills = _.reduce(blackrockData.bosses, function(count, boss) {return count + boss.heroicKills; }, 0);
            blackrockMythicKills = _.reduce(blackrockData.bosses, function(count, boss) {return count + boss.mythicKills; }, 0);
          }


        characterData.HighmaulNormalKills = highmaulNormalKills;
        characterData.HighmaulHeroicKills = highmaulHeroicKills;
        characterData.HighmaulMythicKills = highmaulMythicKills;
        characterData.BlackrockNormalKills = blackrockNormalKills;
        characterData.BlackrockHeroicKills = blackrockHeroicKills;
        characterData.BlackrockMythicKills = blackrockMythicKills;

        var template = $("#members-table").html();
        var renderedHtml = Mustache.render(template, characterData);
        $("#raid-table tbody").append(renderedHtml);

        if (parseProgress == totalMembers) {
          ApiManager.ConstructUi();
        }
    },
    ConstructUi: function() {
      $("#raid-table").dataTable();
      ApiManager.ShowRoster();
    },
    UpdateProgressBar: function(current, total) {
      $("#import-progress").css("width", ((current / total) * 100) + "%");
    },
    ShowLoader: function() {
      $("#raid-table").hide();
      $(".loader").show();
        $(".search-controls").hide();
    },
    ShowRoster: function() {
      $("#raid-table").show();
      $(".loader").hide();
        $(".search-controls").hide();
    },
    ShowSearchBox: function() {
      $("#raid-table").hide();
      $(".loader").hide();
      $(".search-controls").show();
    }
}
