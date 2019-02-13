const logon = function () {
  const name = $('#name').val();
  const passwd = $('#passwd').val();
  $.ajax({
    method: "POST",
    url: "./api/login",
    data: { 
      name: name, 
      passwd: passwd 
    },
  }).done( function( msg ) {
    $('#logon').hide();
    $('#main').show();
  });
}

const getPoints = function(){
  $.ajax({
    method: "GET",
    url: "./api/getPoints",
  }).done( function( msg ) {
    $('#points').text(msg.points);
  });
}

const transfer = function () {
  const name = $('#dstUser').val();
  $.ajax({
    method: "GET",
    url: "./api/transferPoints?dstUser=" + name,
  }).done( function( msg ) {
    getPoints();
  });
}

$(document).ready(function () {
  $('#logon').show();
  $('#main').hide();
})