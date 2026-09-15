<html><style type="text/css">
<!--
body {
	background-color: #051B33;
}
.style1 {
	color: #000033;
	font-weight: bold;
}
.style3 {
	color: #000033;
	font-family: Arial, Helvetica, sans-serif;
}
.style5 {color: #99FF00; font-size: larger;}
.style7 {
	font-size: larger;
	color: #FFFFFF;
}
body,td,th {
	font-family: Verdana, Arial, Helvetica, sans-serif;
	color: #FFFFFF;
}
.style8 {color: #FFFFFF}
.style9 {color: #FFFFFF; font-weight: bold; }
a:link {
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
-->
</style>
<body onLoad="document.form1.kvutza.focus()">

<form action="zupload_file2.php" method="post" enctype="multipart/form-data" name="form1">
<label for="file">
<div align="center" class="style3">
  <p><span class="style9">Voc&ecirc; deu aquela peul&aacute; iraada e quer compartilh&aacute;-la com todos os peilim?<br>
  Envie-a para o</span><span class="style1"> <span class="style5">acervo m&aacute;gico da Tikinternet</span>!<br>
  </span></p>
  <p><span class="style7"><u>Como enviar?</u></span><span class="style8"><br>
    </span></p>
  <ul class="style8">
    <li><strong>Complete O que &eacute; pedido pelos espa&ccedil;os e clique em enviar. </strong></li>
  </ul>
  <ul>
    <li><span class="style8"><strong>Agora, o mais importante: Para seu arquivo &quot;funcionar&quot;, o nome dele n&atilde;o pode conter caracteres especiais como acentos, cedilha, ponto te exclama&ccedil;&atilde;o, emoticons felizes, etc.</strong></span><strong><br>
        <br>
        <a href="http://www.chazit.org.br/acervomagico/index2.php">Clique aqui para acessar o Acervo m&aacute;gico!</a><br>
    </strong></li>
    </ul>
</div>

  <p align="center">
    Nome da Kvutza a que foi dada a peul&aacute;: <br>
    <input name="kvutza" type="text"/><br>
    Tema: <br><input name="tema" type="text"/><br>
  	Dinamica: <br><input name="dinamica" type="text"/><br>
  	Kvutza Shnat a que foi dada: <br><input name="shnat" type="text"/>
  	<br>
    <br>
    <input name="file" type="file" id="file" value="Procure sua peul&aacute; -&gt;" />
    <br>
    <input type="submit" name="submit" value="Enviar" />
    <br />
  </p>
</form>

</body>
</html>