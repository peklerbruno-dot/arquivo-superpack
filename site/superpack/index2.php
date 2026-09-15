
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<html>

<head>

<title>Super Pack Chazit SP</title>

<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">

<style type="text/css">

<!--

body,td,th {

	color: #FFFFFF;

}

body {

	background-color: #051B33;

}

a {

	font-family: Verdana, Arial, Helvetica, sans-serif;

	color: #FFFFFF;

}

a:visited {

	color: #FFFFFF;

}

a:hover {

	color: #00FFFF;

}

a:active {

	color: #FFFFFF;

}

.style1 {font-family: Verdana, Arial, Helvetica, sans-serif}

h1,h2,h3,h4,h5,h6 {

	font-family: Verdana, Arial, Helvetica, sans-serif;

}
.aviso{
	position:relative;
	left:5px;
	top:-2px
}
-->

</style>

<script language="JavaScript" type="text/JavaScript">

<!--

function MM_reloadPage(init) {  //reloads the window if Nav4 resized

  if (init==true) with (navigator) {if ((appName=="Netscape")&&(parseInt(appVersion)==4)) {

    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; }}

  else if (innerWidth!=document.MM_pgW || innerHeight!=document.MM_pgH) location.reload();

}

MM_reloadPage(true);

//-->

function toggle(id) {

       var e = document.getElementById(id);

       if(e.style.display == 'block')

          e.style.display = 'none';

       else

          e.style.display = 'block';

    }

</script>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>



<script>

$(function(){

$('.menu').click( function(){

href=$(this).attr('href');

$('.botton').fadeOut( function(){

document.getElementById('botton').src=href;

$('.botton').fadeIn();

});

return false;

});

});

</script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js">
</script>
</head>



<body style="overflow: hidden" onLoad="setTimeout(muda2, 4000);">

<div id="logo" class="logo" style="position:absolute; left:75%; top:90%; width:210px; height:44px; z-index:5"><img src="internetlogo.png" width="237" height="42"><div style="background-color: #039; color:white; position:absolute; right:-3px; bottom:-3px; padding-left:3px; padding-right:3px; font-family:Verdana, Geneva, sans-serif; cursor:pointer" onClick="$('.logo').hide();">x</div></div>

<span class="style1">Super Pack Chazit Hanoar: <span id="wrap" onMouseOver="$('#menu2').show();" onMouseOut="$('#menu2').hide();" onMouseMove=""><a style="cursor:pointer" class="menu" href="principal.php"><u>Menu <font size="-10">&#9660;</font></u></a>

<span id="menu2" style="position:absolute; left: 220px; top: 26px; width: 163px; z-index:2000; display:none">

<TABLE width="180" border="1" cellspacing="0" bordercolor="#FFFFFF" bordercolorlight="#FFFFFF" bordercolordark="#FFF"  bgcolor="#051B33">

 <!-- <TR>

    <TD width="158"><span onClick="$('#menuperfil').toggle();" onMouseOver="$('#menuperfil').show();" onMouseOut="$('#menuperfil').hide();"  href="#"><a href="#">Perfil dos Peilim &raquo;</a>

    	<div id="menuperfil" style="position:absolute; left: 147px; top: 0px; display:none; width: 160px;">

            <TABLE width="164" border="1" cellspacing="0" bordercolor="#FFFFFF" bordercolorlight="#FFFFFF" bordercolordark="#FFF"  bgcolor="#051B33">

                <tr>

                    <TD><a class="menu" href="http://www.chazit.org.br/perfil/atencao.php">Criar Perfil no Site </a></TD>

                </tr>

                <TR>

                    <td><a class="menu" href="http://www.chazit.org.br/perfil"> Visualizar Perfis</a></td>

                </TR>

            </TABLE>

        </div>

    </span>

    </TD>

  </TR>

  <TR>

    <TD>

    <span onClick="$('#menuacervo').toggle();" onMouseOver="$('#menuacervo').show();" onMouseOut="$('#menuacervo').hide();"  href="#"><a href="#">Acervo M&aacute;gico &raquo;</a>

    	<div id="menuacervo" style="position:absolute; left: 130px; top: 22px; display:none; width: 149px;">

            <TABLE width="164" border="1" cellspacing="0" bordercolor="#FFFFFF" bordercolorlight="#FFFFFF" bordercolordark="#FFF"  bgcolor="#051B33">

                <tr>

                    <TD><a class="menu" href="http://www.chazit.org.br/acervomagico/index2.php">Acessar o Acervo</a></TD>

                </tr>

                <TR>

                    <td> <a class="menu" href="http://www.chazit.org.br/upload2.php">Upload de Peulot</a></td>

                </TR>

            </TABLE>

        </div>

    </span>

    </TD>

  </TR>-->

  <TR>

    <TD><a class="menu" href="http://www.chazit.org.br/secretgame">Jogo Bônus</a></TD>

  </TR>
  <TR>

    <TD><a href="http://www.chazit.org.br/superpack/machberet" target="_blank">Machberet Kvutza</a></TD>

  </TR>
  
  <TR>

    <TD><a href="http://www.chazit.org.br/superpack/armario" target="_blank">Armário da Tik</a></TD>

  </TR>
  <TR>

    <TD><a class="menu" href="http://www.chazit.org.br/superpack/tutorial.php">Tutoriais</a></TD>

  </TR>

</TABLE>



</span>

</span> | <a href="logout.php" target="_top"> Log Out...</a>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js">
</script>
<script>
var pronto=0;
function muda2(){
	if(pronto==0){
		muda();
	}
}
$(document).ready(function(){
						   
    $(".box").hide();
});
var ida=0;
function muda(){
	pronto=1;
	if(ida==0){
		$('.box').slideDown();
		$(".avisos").css("border-bottom-width","0px");
	}
	 if(ida==1){
				$('.box').slideUp(function(){
		$(".avisos").css("border-bottom-width","2px");
	});
	}
	if(ida==1){
	ida=0;	
	}else{
		ida=1;
	}
}
function liga(){
	$(".avisos").css("background-color","#FFFFFF");
	$(".avisos").css("color","#051B33");
}
function apaga(){
	$(".avisos").css("background-color","#051B33");
	$(".avisos").css("color","#FFFFFF");
}
</script>
<div style="position:absolute; border:2px solid white; right:40px; z-index:10; top:2px;background-color:#051B33; padding:3px; cursor:pointer;" id='avisos' class='avisos' onClick="muda()" onMouseOver="liga()" onMouseOut="apaga()"> AVISOS: 
</div>
<div style="border:2px solid white; width:400px; z-index:7; background-color:#051B33; position:absolute;right:40px; top:26px; font-size:12px;" id="box" class="box">
  <br />
<b>Warning</b>:  mysql_connect() [<a href='function.mysql-connect'>function.mysql-connect</a>]: Server is running in --secure-auth mode, but 'chazit3'@'187.45.193.158' has a password in the old format; please change the password to the new format in <b>/home/storage/0/42/e6/chazit/public_html/superpack/index2.php</b> on line <b>293</b><br />
nao conecta ao banco: Server is running in --secure-auth mode, but 'chazit3'@'187.45.193.158' has a password in the old format; please change the password to the new format