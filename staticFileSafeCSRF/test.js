const setCSRF = function(req){
  $("#csrf-token").attr("content", req.getResponseHeader("CSRF"));
}

const getCSRF = function(){
  return $("#csrf-token").attr("content");
}

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
  }).done( function( msg,textStatus, request ) {
    $('#logon').hide();
    setCSRF(request);
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
    method: "POST",
    url: "./api/transferPoints",
    headers: {
      'csrf': getCSRF(),
    },
    data: {
      dstUser: name
    }
  }).done( function( msg, textStatus, request ) {
    setCSRF(request);
    getPoints();
  });
}

$(document).ready(function () {
  $('#logon').show();
  $('#main').hide();
})