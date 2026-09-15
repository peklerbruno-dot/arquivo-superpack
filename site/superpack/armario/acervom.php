<style>
.tabelabusca {
	margin:0px;padding:0px;
	width:100%;
	border:1px solid #000000;
}.tabelabusca table{
	width:100%;
	margin:0px;padding:0px;
}
.tabelabusca tr:nth-child(odd){ background-color:#ffaa56; }
.tabelabusca tr:nth-child(even)    { background-color:#ffffff; }
.tabelabusca td{
	vertical-align:middle;
	
	
	border:1px solid #000000;
	border-width:0px 1px 1px 0px;
	text-align:left;
	padding:14px;
	font-size:19px;
	font-family:Arial;
	font-weight:normal;
	color:#000000;
}.tabelabusca tr:last-child td{
	border-width:0px 1px 0px 0px;
}.tabelabusca tr td:last-child{
	border-width:0px 0px 1px 0px;
}.tabelabusca tr:last-child td:last-child{
	border-width:0px 0px 0px 0px;
}.tabelabusca tr:first-child td{
		background:-o-linear-gradient(bottom, #ff7f00 5%, #bf5f00 100%);	background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ff7f00), color-stop(1, #bf5f00) );
	background:-moz-linear-gradient( center top, #ff7f00 5%, #bf5f00 100% );
	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ff7f00", endColorstr="#bf5f00");	background: -o-linear-gradient(top,#ff7f00,bf5f00);

	background-color:#ff7f00;
	border:0px solid #000000;
	text-align:center;
	border-width:0px 0px 1px 1px;
	font-size:23px;
	font-family:Arial;
	font-weight:bold;
	color:#ffffff;
}.divbusca{
		background:-o-linear-gradient(bottom, #ff7f00 5%, #bf5f00 100%);	background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ff7f00), color-stop(1, #bf5f00) );
	background:-moz-linear-gradient( center top, #ff7f00 5%, #bf5f00 100% );
	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ff7f00", endColorstr="#bf5f00");	background: -o-linear-gradient(top,#ff7f00,bf5f00);

	background-color:#ff7f00;
	border:0px solid #000000;
	text-align:center;
	border-width:0px 0px 1px 1px;
	font-size:23px;
	font-family:Arial;
	font-weight:bold;
	color:#ffffff;
	padding: 7px;
}
.tabelabusca tr:first-child td:first-child{
	border-width:0px 0px 1px 0px;
}
.tabelabusca tr:first-child td:last-child{
	border-width:0px 0px 1px 1px;
}

.umpoucomais {
	display:none;
}

</style>
<div class="divbusca">
	Buscar no A.M.: <input type="text" id="palavrachave"/><input type="button" value="Buscar" onclick="buscainterna();"/>
</div>
<script>
nini=;
nfim=;
function prov1(){
	$('#tamcerto').css("height", $('#busca').height() - $('.divbusca').height()*2);
}
prov1();

function buscainterna(){
	palavrachave = $("#palavrachave").val();
	entrarAM(palavrachave,0,15);
}

function mostramais(e){
e.next('.umpoucomais').slideToggle();	
e.html("");
}

</script>
<div id="tamcerto" style="overflow-y: auto; overflow-x:hidden;">
<div class="tabelabusca">
<table>
<tr>
 <td>Peulot de Sábado - página 0</td>
</tr>
    fudeu db no1