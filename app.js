$(function(){
  
    $("#btnSearch").on("click", function(){
        var realm = $("#realm").val();
        var guild = $("#guild").val();
        var region = $("#region").val();
        ApiManager.GetGuildMembers(region, realm, guild);
    });
  
});
