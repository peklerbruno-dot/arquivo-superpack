// Classe de menu
function Menu(atop,aleft){
//atributos
	var num_but;
	var win_width;
	var win_height;
	var menu_total_height;
	var blank_space;
	var but_height;
	var but_width;
	var buttons;
	var top;
	var left=0;
	
//construct
	this.buttons = new Array();
	this.num_but = 0;
	this.win_width = $(window).width();
	this.win_height = $(window).height();
	this.menu_total_height = (this.win_height - ( parseFloat($('#logodiv').css('top')) + parseFloat($('#logodiv').height()) ) );
	this.blank_space = this.menu_total_height*0.1;
	this.but_height = $('#logodiv').height()/2;
	this.but_width = $('#sidebardiv').width();
	this.top = atop;
	this.left = aleft;
	//posiciona e redimensiona div do menu no lugar e tamanhos certos
	$("body").append("<div class='menu' style='position:absolute; z-index:10'><div>");
	$(".menu").css('height', this.menu_total_height*0.9);
	$(".menu").css('width', this.but_width);
	$(".menu").css('left',this.left);
	$(".menu").css('top', this.top);
	
	
//methods
	//funcao calcula o espaco em branco entre os botoes do menu;
	this.calc_space= function()
	{
		var but_total_space = this.num_but * this.but_height;
		var space_total = this.num_but * this.blank_space;
		var space_total = space_total + but_total_space;
		while(space_total>this.menu_total_height){
			this.blank_space = this.blank_space/2;
			var but_total_space = this.num_but * this.but_height;
			var space_total = this.num_but * this.blank_space;
			var space_total = space_total + but_total_space;
			if(this.blank_space == 0){
				break;
			}
		}
		return this.blank_space;		
	}
	
	//funcao cria botão
	this.create_button = function(value, func)
	{
		var mudou = this.is_buttons_reordered();
		var b = new Button(value, func);
		b.html_class = "menu_but";
		b.height = this.but_height;
		b.width = this.but_width;
		b.top = this.num_but*(this.but_height+ this.blank_space);
		this.num_but +=1;
		b.num = this.num_but;
		b.html_id = "menu_but_"+b.num;
		b.create_but();
		var tamanhoreal = $("#"+b.html_id).height();
		if(tamanhoreal>this.but_height){
			while(tamanhoreal>this.but_height){
				$("#"+b.html_id).css('font-size', (parseFloat($("#"+b.html_id).css('font-size')))*0.9)
				tamanhoreal = $("#"+b.html_id).height();
			}
		}
		$("#"+b.html_id).css('left',-1*($("#"+b.html_id).width()*1.5));
		$('.menu_but').hover(
  			function() {
    			$(this).animate({left:0, width: $('#logodiv').width()},{queue: false,duration: 300},"easeOutExpo");
  			}, function() {
    			$(this).animate({left:0, width: $('#sidebardiv').width()},{queue: false,duration: 300},"easeOutExpo");
  			}
		);
		$("#"+b.html_id).click(function(){ 
			b.func();
		});
		this.buttons.push(b);
		if(mudou==1){
			this.reorder_buttons();
		}
	}
	
	//função mostra botoes
	this.show_buttons = function()
	{
		for(var i=0; i<this.buttons.length; i++){
			this.buttons[i].show(i);
		}
	}
	
	//funcao verifica se os botoes devem ser ordenados ou não
	this.is_buttons_reordered = function()
	{
		var ini = this.blank_space;
		var totalspace = (this.num_but+1)*(this.but_height+ this.blank_space);
		while(totalspace>this.menu_total_height-100)
		{
			this.blank_space = this.blank_space*0.5;
			totalspace = (this.num_but+1)*(this.but_height+ this.blank_space);
			if(this.blank_space<1){
				break;
			}
		}
		if(ini!=this.blank_space)
		{
			return 1;
		}else
		{
			return 0;
		}
	};
	
	//funcao atualiza os top dos botoes e os reordena botos
	this.reorder_buttons = function()
	{
		var aux;
		for(var i=1; i<this.buttons.length; i++){
			aux = parseFloat(this.buttons[i-1].top);
			aux += this.but_height + this.blank_space;
			this.buttons[i].top = aux;
			this.buttons[i].reorder();
		}
	}
}

function Button(avalue, afunc){
//attributes
	var top;
	var left;
	var width;
	var height;
	var value;
	var func;
	var num;
	var html_id;
	var html_class;
	var visible;
	
//construct
	this.value = avalue;
	this.func = afunc;
	this.visible=0;
//methods
	this.button_click = this.func;	
	this.create_but = function(){
		$(".menu").append("<div class='"+this.html_class+"' id='"+this.html_id+"' style='background-color: #006; position:absolute; font-family:cartoon; font-size; font-size:"+$(window).height()*0.04+"; z-index:11;padding-right:20px; cursor:pointer; box-shadow: 10px 10px 5px #004; top:"+this.top+"px' visivel=0><div style='float:right'>"+this.value+"</div></div>");
	}
	
	this.show = function(e){
		$("#"+"menu_but_"+this.num).delay(e*300).animate({left:0, width: $('#sidebardiv').width()},1500,"easeOutExpo");
		this.visible=1;
	}
	
	this.reorder = function(){
		if(this.visible==1){
			$("#"+"menu_but_"+this.num).animate({left: this.left, top:this.top },700,"easeOutExpo");
		}else{
			$("#"+"menu_but_"+this.num).css('left', this.left);
			$("#"+"menu_but_"+this.num).css('top', this.top);	
		}
	}
	
}
