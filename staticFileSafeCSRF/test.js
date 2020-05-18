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
  }).done( function( msg , _, request ) {
    setMainPage(msg.name);
    setCSRF(request);
  });
}
const logout = () => {
  $.ajax({
    method: "GET",
    url: "./api/logout",
  }).done( function( msg ) {
    setLogonPage();
  });
}

const checkLogin = function (){
  $.ajax({
    method: "GET",
    url: "./api/checkLogin",
  }).done( function( msg ) {
    setMainPage(msg.name)
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

const setMainPage = ( username ) => {
  $('#logon').hide();
  $('#main').show();
  $('#displayName').text(username);
  getPoints()
}
const setLogonPage = () => {
  $('#logon').show();
  $('#main').hide();
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
  }).done( function( msg , _, request ) {
    getPoints();
    setCSRF(request);
  });
}

$(document).ready(function () {
  setLogonPage();
  checkLogin()
})