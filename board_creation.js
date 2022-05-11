
//Defined in .jsp file:
//var level = "";
//var level_number=(int);
//var number_of_levels=(int);

var game_area_width = 1000;
var game_area_height = 600;

var limiting_dimension = "width";

var start_top = 150;
var start_left= 400;

var block_width = 60;//60;
var block_height = 56;//56;
var block_size_ratio = 0.933;//==height/width of block.

var height_divisor=2.8;//2.6;
var width_divisor=2;
var raiser_divisor=3.5;//4.32;

var bot_width = block_width;
var bot_height = block_height*2;
var bot_height_offset = 1.45;

var bot_images = [
	["standing_down","standing_right","standing_up","standing_left"],
	["jumping_down","jumping_right","jumping_up","jumping_left"],
	["walking_down","walking_right","walking_up","walking_left"],
	["lit_down","lit_right","lit_up","lit_left"],
	["crouched_down","crouched_right","crouched_up","crouched_left"]
];
var directions = ["down","right","up","left"];
var bot_actions = ["standing","jumping","walking","lit", "crouched"];

var bot_start_data = 
{
	top:0,
	left:0,
	target_top:0,
	target_left:0,
	direction:0,//0-3 -> down, right, up, left (front-left, front-right, back-right, back-left).
	zIndex: 2,
	row: 0,
	column: 0,
	image:"",
	height:0,
	action:0, //0-4 -> standing, jumping, walking, lit, crouched
	current_walk:0
};
var bot_data = null;

var bot=null;

var game_area_padding_percentage=10;
var game_area_padding = 0;

//window.onresize = function(){window.location.reload();}//Rebuild the board to the new dimensions.

var base_instructions = [];//[3][4].
var f1_instructions = [];//[2][4].
var f2_instructions = [];//[2][4].

var level_data_string = "";

var board = [];

function getLevelData()
{
	level_data_string="";
	
	fetcher("level-reader",{
		method:"GET",
		headers:
		{
			"oper":"load_level",
			"level":level
		}

	})
	.then(function(resp)
	{
		if(resp.redirected)
		{window.location=resp.url; return;}

		resp.json()
		.then(function(data)
		{
			//console.log("data = "+JSON.stringify(data));//debug**
			level_data_string = data.level_data;
			buildLevel(level_data_string);
		});//then.
	})//then.
	.catch(function(error)
	{
		alert("Error retrieving level data:\n"+error);
	});//catch.

	squareElements(document.getElementsByClassName("instruction_cell"), "width");
	squareElements(document.getElementsByClassName("instruction_option"), "height");
}//getLevelData().


function buildLevel()
{
	var rows_strings = level_data_string.split("\n");

	//Set game_area element size to take up the whole left hand side of the window.
	var window_height = window.innerHeight;
	var game_area = document.getElementById("game_area");
	game_area_height = game_area.offsetHeight;
	if(game_area_height<window_height)
	{
		game_area_height = window_height;
		game_area.style.height = game_area_height+"px";
	}//if.

	game_area_width = game_area.offsetWidth;
	game_area_padding = game_area_width*game_area_padding_percentage/100;
	block_width = (game_area_width-game_area_padding)/(rows_strings.length+4);
	block_height = block_width*block_size_ratio;
	if(game_area_height<game_area_width)
	{
		limiting_dimension="height";
		game_area_padding = game_area_height*game_area_padding_percentage/100;
		block_height = (game_area_width-game_area_padding)/(rows_strings.length+4);
		block_width = block_height/block_size_ratio;
	}//if.
	//game_area.style.padding=game_area_padding+"px";
	bot_width = block_width;
	bot_height = block_height*2;

	var instruction_options_bar = document.getElementById("instruction_options_bar");
	var options_bar_height = instruction_options_bar.offsetHeight;
	var options_bar_width = instruction_options_bar.offsetWidth;
	//instruction_options_bar.style.top = (window_height-options_bar_height-10)+"px";
	instruction_options_bar.style.top = "10px";
	instruction_options_bar.style.left = game_area_width-(options_bar_width+5)+"px";
	//console.log("instruction_options_bar.top = "+instruction_options_bar.style.top);//debug**

	var control_bar = document.getElementById("control_bar");
	var control_bar_height = control_bar.offsetHeight;
	var control_bar_width = control_bar.offsetWidth;
	control_bar.style.top = (window_height-control_bar_height-10)+"px";
	control_bar.style.left = game_area_width-(control_bar_width+5)+"px";
	//console.log("control_bar.top = "+control_bar.style.top);//debug**

	start_top = game_area_padding;
	start_left = (game_area_width-game_area_padding)/2;

	var existing_blocks = game_area.getElementsByClassName("block");
	while(existing_blocks[0]!=null)//Clear any existing blocks first.
	{
		game_area.removeChild(existing_blocks[0]);
	}//while.
	if(bot!=null)
	{game_area.removeChild(bot);}

	var row_top = start_top;
	var row_left = start_left;
	var cell_zindex = 1;//The z-index of stacked blocks.
	for(r=0; r<rows_strings.length; r++)
	{
		var curr_top = row_top;
		var curr_left = row_left;
		var cells = rows_strings[r].split("|");
		for(c=0; c<cells.length; c++)
		{
			var cell = cells[c].split(",");
			var stack_size = Number(cell[0]);
			var lightable = Number(cell[1]);
			var block_top = curr_top;

			var ss=0;
			while(ss<stack_size)
			{
				var cell = document.createElement("DIV");
				cell.classList.add("block");
				cell.style.left=curr_left+"px";
				cell.style.width=block_width+"px";
				cell.style.height=block_height+"px";

				if(ss>0)
				{
					block_top-=(block_height/3.5);//4.32);
					cell_zindex++;
					cell.style.zIndex=cell_zindex;
				}//if.
				//else
				//{cell.style.zIndex=1;}
				//cell.style.zIndex=cell_zindex;
				cell.setAttribute("zIndex",cell_zindex);
				cell.style.top=block_top+"px";
				cell.setAttribute("height",ss);
				//console.log("cell.zIndex="+cell.style.zIndex);//debug**

				game_area.appendChild(cell);
				if(ss==(stack_size-1))//Only the top block of the stack is relevant so only it needs an id.
				{
					cell.id=r+"_"+c+"cell";
					cell.setAttribute("row",r);
					cell.setAttribute("column",c);
					if(lightable==-1)//Lightable block.
					{cell.classList.add("lightable");}
				}//if.
				ss++;
			}//for(ss).

			if(lightable>=2)//Bot start position.
			{
				bot_start_data.top=block_top-(bot_height/bot_height_offset);
				bot_start_data.left=curr_left;
				bot_start_data.zIndex=cell_zindex;
				bot_start_data.row=r;
				bot_start_data.column=c;
				bot_start_data.direction=lightable-2;//0-3 -> down, right, up, left (front-left, front-right, back-right, back-left).
				bot_start_data.height=(ss-1);
				//bot_start_data.image=bot_images[bot_start_data.direction];
			}//if.

			curr_top+=(block_height/height_divisor);
			curr_left+=(block_width/width_divisor);		
		}//for(c).
		row_top+=(block_height/height_divisor);
		row_left-=(block_width/width_divisor);
	}//for(r).

	bot_data = Object.assign({},bot_start_data);//copy bot_start_data into bot_data but leave bot_start_data intact so bot can be reset.

	bot = document.createElement("IMG");
	bot.classList.add("bot");
	//bot.src="images/"+bot_start_data.image;
	bot.style.top=bot_data.top+"px";
	bot.style.left=bot_data.left+"px";
	bot.style.width = bot_width+"px";
	bot.style.height = bot_height+"px";
	bot.style.zIndex = bot_data.zIndex;
	game_area.appendChild(bot);

	gameStartUp();//defined in gameplay.js
}//buildLevel().


function squareElements(elements, reference_dim)
{
	//console.log("squaring elements...");//debug**
	for(e=0; e<elements.length; e++)
	{
		var element = elements[e];
		var width = element.offsetWidth;
		var height = element.offsetHeight;
		if(reference_dim=="width")
		{element.style.height=width+"px";}
		else
		{element.style.width=height+"px";}
	}//for(e).
}//squareElements().


function resetBoard()
{
	bot_data=null;
	buildLevel();
}//resetBoard().