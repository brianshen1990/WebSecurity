const logon = function () {
  const name = $('#name').val();
  const passwd = $('#passwd').val();
  const request = $.ajax({
    method: "POST",
    url: "./api/login",
    data: { 
      name: name, 
      passwd: passwd 
    },
    success: ( msg ) => {
      alert(msg.message);
    },
    error:( httpObj ) => {
      alert(httpObj.responseJSON.message);
    },
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
    method: "GET",
    url: "./api/transferPoints?dstUser=" + name,
  }).done( function( msg ) {
    getPoints();
  });
}

$(document).ready(function () {
  setLogonPage();
  checkLogin()
})