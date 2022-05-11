var block_images_path = "images/";
var bot_images_path = "images/bot/";

var bot_step_size=1;//pixels moved per step.
var bot_step_time=50;//milliseconds between steps.


var base_instructions = [];
var f1_instructions = [];
var f2_instructions = [];
var compiled_instructions = [];//debug**

var command_index=0;
var all_commands = {};

var active_command_index=0;//The index of the currently active command in all_commands.

//var total_commands_count=0;//Used to find infinite loops.
var max_total_commands=433;

/*
bot_start_data = 
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
*/

function gameStartUp()
{
	updateBotIcon();
}//gameStartup().

function dragActionOption(event)
{
	event.dataTransfer.setData("text", event.target.id);
}//dragActionOption().

function allowDrop(event)
{
  event.preventDefault();
}//allowDrop().

function dropActionOption(event)
{
	//console.log("dropActionOption()...");//debug**
	event.preventDefault();

	var action_option_id = event.dataTransfer.getData("text");
	var action_option = document.getElementById(action_option_id);

	var drop_area = event.target;
	if(drop_area.id=="delete" && action_option.classList.contains("replicant"))
	{
		action_option.parentElement.removeChild(action_option);
		return;
	}//if.
	while(!drop_area.classList.contains("instruction_cell"))
	{drop_area=drop_area.parentElement;}

	var action_option_copy = action_option.cloneNode(true);
	action_option.id=Date.now();
	action_option_copy.classList.add("replicant");
	action_option_copy.setAttribute("action",action_option.getAttribute("action"));

	var parent_width = drop_area.offsetWidth;
	var parent_height = drop_area.offsetHeight;
	action_option_copy.style.width = (parent_width-(parent_width*0.1));
	action_option_copy.style.height = (parent_height-(parent_height*0.1));
	action_option_copy.ondragover=allowDrop;
	action_option_copy.ondrop=dropActionOption;

	while(drop_area.firstChild)
	{drop_area.removeChild(drop_area.firstChild);}
	drop_area.appendChild(action_option_copy);
}//dropActionOption().


function pressPlay()
{
	var play_button = document.getElementById("run_commands");
	var play=true;
	if(play_button.classList.contains("stop"))
	{play=false;}

	play_button.classList.toggle("stop");

	if(!play)
	{
		command_index=0;
		active_command_index=0;
		total_commands_count=0;
		all_commands=[];
		base_instructions=[];
		f1_instructions=[];
		f2_instructions=[];
		//bot_data = Object.assign({},bot_start_data);
		resetBoard();//defined in board_creation.js
		return;
	}//if.

	buildInstructionSet();
	command_index=0;
	all_commands = compileInstructions(base_instructions);
	//console.log("all_commands = "+Object.keys(all_commands).length);//debug**
	if(all_commands==null)
	{
		pressPlay();
	}//if.
	runNextCommand();
}//pressPlay().

function buildInstructionSet()
{
	base_instructions = extractInstructions("base_instructions");
	f1_instructions = extractInstructions("f1_instructions");
	f2_instructions = extractInstructions("f2_instructions");

	console.log("base_instructions="+JSON.stringify(base_instructions));//debug**
	console.log("f1_instructions="+JSON.stringify(f1_instructions));//debug**
	console.log("f2_instructions="+JSON.stringify(f2_instructions));//debug**
}//buildInstructionSet().

function extractInstructions(parent_element_id)
{
	var instruction_set = [];
	var instructions_container = document.getElementById(parent_element_id);
	var instruction_options = instructions_container.getElementsByClassName("instruction_option");
	for(io=0; io<instruction_options.length; io++)
	{
		var option = instruction_options[io];
		instruction_set[io] = option.getAttribute("action");
	}//for(io).
	return instruction_set;
}//extractInstructions().

function compileInstructions(instruction_set)
{
//	console.log("compileInstructions():");//debug**
//	console.log("instruction_set="+JSON.stringify(instruction_set));//debug**
//	var offset=0;
//	var commands = [];
	for(var i=0; i<instruction_set.length; i++)
	{
		var instruction=instruction_set[i];
		console.log("command_index="+command_index);//debug**
		console.log("instruction = "+instruction);//debug**
		if(instruction=="forward")
		{all_commands[command_index]=forward;}
		else if(instruction=="light")
		{all_commands[command_index]=light;}
		else if(instruction=="turn_c")
		{all_commands[command_index]=turnC;}
		else if(instruction=="turn_ac")
		{all_commands[command_index]=turnAC;}
		else if(instruction=="jump")
		{all_commands[command_index]=jump;}
		else if(instruction=="f1")
		{
			var function_commands = compileInstructions(f1_instructions,i);
			if(function_commands==null)//something went wrong.
			{return null;}
			continue;
			//offset+=function_commands.length;
			//commands = commands.concat(function_commands);
		}//else if.
		else if(instruction=="f2")
		{
			var function_commands = compileInstructions(f2_instructions,i);
			if(function_commands==null)//something went wrong.
			{return null;}
			continue;
			//offset+=function_commands.length;
			//commands = commands.concat(function_commands);
		}//else if.
		else
		{
			alert("Unknown instruction! -> '"+instruction+"'");
			return null;
		}//else.

		if(instruction!="f1" && instruction!="f2")//debug**
		{
			compiled_instructions[command_index]=instruction;//debug**
		}//if.
		console.log("compiled_instructions = "+compiled_instructions);//debug**

		command_index++;
		//console.log("command_index="+command_index);//debug**
		if(command_index>max_total_commands)
		{
			alert("Infinte loop detected!");
			return null;
		}//if.
	}//for(i).
	//console.log("compileInstructions(): commands = "+commands);//debug**
	return all_commands;
}//compileInstructions().

function forward()
{
	console.log("forward()...");//debug**
	bot_data.action=2;//walking.
	var target_block = getTargetBlock();
	var target_height = Number(target_block.getAttribute("height"));
	//console.log("target_height="+target_height+" bot_height="+bot_data.height);//debug**
	if(Math.abs(target_height-bot_data.height)>0)//Target block must be the same height.
	{
		bot_data.action=0;//set bot back to standing.
		updateBotIcon();
		setTimeout(runNextCommand,300);
		return;
	};

	setTargetCoordinates(target_block);
	updateBotIcon();
	setTimeout(walkBot,bot_step_time);
}//forward().

function turnC()
{
	console.log("turnC():");//debug**
	//console.log("start direction = "+bot_data.direction);//debug**
	bot_data.direction-=1;
	if(bot_data.direction<0)
	{bot_data.direction=3;}
	//console.log("direction = "+bot_data.direction);//debug**
	updateBotIcon();
	runNextCommand();
}//turnC().

function turnAC()
{
	console.log("turnAC():");//debug**
	//console.log("start direction = "+bot_data.direction);//debug**
	bot_data.direction+=1;
	if(bot_data.direction>3)
	{bot_data.direction=0;}
	//console.log("direction = "+bot_data.direction);//debug**
	updateBotIcon();
	runNextCommand();
}//turnAC().

function light()
{
	console.log("light():");//debug**
	if(bot_data.action==3)//'light' action complete, stand up again.
	{
		bot_data.action=0;//set back to standing.
		updateBotIcon();
		runNextCommand();
	}//if.
	else
	{
		var target_block = getTargetBlock();
		if(target_block.classList.contains("lightable"))
		{target_block.classList.toggle("lit");}
		bot_data.action=3;
		updateBotIcon();
		setTimeout(light, 200);//call this method again to make it stand up again.
	}//else.
}//light().

function jump()
{
	console.log("jump");//debug**	
	bot_data.action=1;
	var target_block = getTargetBlock();
	var target_height = Number(target_block.getAttribute("height"));
	console.log("target_height="+target_height+" bot height="+bot_data.height);//debug**
	//if(Math.abs(target_height-bot_data.height)>1)//Can't jump more than 1 block.
	if((target_height-bot_data.height)>1 || (target_height-bot_data.height)==0)
	{
		console.log("height difference is too great or ==0, can't jump.");//debug**
		bot_data.action=0;//set back to standing.
		setTimeout(runNextCommand,500);
		return;
	};

	setTargetCoordinates(target_block);
	updateBotIcon();
	setTimeout(jumpBot,50);
}//jump().

function getTargetBlock()
{
	console.log("getTargetBlock():");//debug**
	var block_row = bot_data.row;
	var block_column = bot_data.column;

	if(bot_data.action==0 || bot_data.action==3)//Standing or 'lighting'.
	{
		block_row=bot_data.row;
		block_column=bot_data.column;
	}//if.
	else if(bot_data.direction==0)//down.
	{block_row=bot_data.row+1;}
	else if(bot_data.direction==1)//right.
	{block_column=bot_data.column+1;}
	else if(bot_data.direction==2)//up
	{block_row=bot_data.row-1;}
	else if(bot_data.direction==3)
	{block_column=bot_data.column-1;}

	var block = document.getElementById(block_row+"_"+block_column+"cell");
	return block;
}//getTargetBlock().

function setTargetCoordinates(block)
{
	console.log("setTargetCoordinates():");//debug**
	console.log("block.id="+block.id);//debug**
	//console.log("block.offsetTop="+block.offsetTop);//debug**

	var target_height = Number(block.getAttribute("height"));
	var block_row = Number(block.getAttribute("row"));
	var block_column = Number(block.getAttribute("column"));
	var block_zIndex = Number(block.getAttribute("zIndex"));
	bot_data.target_top=block.offsetTop-(bot_height/bot_height_offset);//bot_height_offset defined in board_creation.js
	bot_data.target_left=block.offsetLeft;
	bot_data.zIndex=block_zIndex;
	bot_data.height=target_height;
	bot_data.row=block_row;//Update to destination index.
	bot_data.column=block_column;//Update to destination index.

	bot.style.zIndex=bot_data.zIndex;
}//getTargetCoordinates().

function walkBot()
{
	console.log("walkBot()...");//debug**
	if(hasReachedTarget())
	{
		bot_data.action=0;
		updateBotIcon();
		runNextCommand();
		return;
	}//if.

	moveBot();
	updateBotIcon();
	setTimeout(walkBot, bot_step_time);
}//walkBot().

function jumpBot()
{
	if(hasReachedTarget())
	{
		bot_data.action=0;
		updateBotIcon();
		runNextCommand();
		return;
	}//if.

	moveBot();
	setTimeout(jumpBot, bot_step_time);
}//jumpBot().

function moveBot()
{
	console.log("moveBot():");//debug**
	var gradient = (bot_data.target_left-bot_data.left)/(bot_data.target_top-bot_data.top);
	//console.log("bot_data.top="+bot_data.top+" bot_data.left="+bot_data.left);//debug**
	//console.log("bot_data.target_top="+bot_data.target_top+" bot_data.target_left="+bot_data.target_left);//debug**
	//console.log("gradient="+gradient);//debug**
	var y_change = bot_step_size;
	if(bot_data.direction==2 || bot_data.direction==3)//up or left.
	{y_change=-bot_step_size;}

	var x_change=y_change*gradient;
	//console.log();//debug**

	bot_data.top=bot_data.top+y_change;
	bot_data.left=bot_data.left+x_change;
	bot.style.top=bot_data.top+"px";
	bot.style.left=bot_data.left+"px";
}//moveBot().

function hasReachedTarget()
{
	console.log("hasReachedTarget():");//debug**
	var top_difference = bot_data.target_top-bot_data.top;
	var left_difference = bot_data.target_left-bot_data.left;

	if(bot_data.direction==0 && top_difference<0)//down.
	{return true;}
	if(bot_data.direction==1 && left_difference<0)//right.
	{return true;}
	if(bot_data.direction==2 && top_difference>0)//up.
	{return true;}
	if(bot_data.direction==3 && left_difference>0)//left.
	{return true;}
	
	console.log("\tfalse");//debug**
	return false;
}//hasReachedTarget().

function updateBotIcon()
{
	var icon_base_name = bot_images[bot_data.action][bot_data.direction];
	//console.log("updateBotIcon(): icon_base_name="+icon_base_name);//debug**
	//console.log("bot action = "+bot_data.action);//debug**
	if(bot_data.action==2)//walking.
	{
		if(bot_data.current_walk<=3)
		{icon_base_name+="1";}
		else
		{icon_base_name+="2";}
		bot_data.current_walk+=1;
		if(bot_data.current_walk>6)
		{bot_data.current_walk=0;}
	//	bot.classList.add(icon_base_name);
	//	bot.classList.toggle(icon_base_name+"1");
	}//if.
	bot.style.content="url('"+bot_images_path+icon_base_name+".png')";
}//updateBotIcon.


function runNextCommand()
{
	console.log("runNextCommand():");//debug**
	bot_data.action=0;
	bot_data.current_walk=0;
	updateBotIcon();
	console.log("active_command_index="+active_command_index+" all_commands.length="+all_commands.length);//debug**
	if(active_command_index>=all_commands.length)
	{
		active_command_index=0;
		checkLevelComplete();
		return;
	}//if.
	var active_command = all_commands[active_command_index];
	//console.log(" active_command = "+all_commands[active_command_index]);//debug**
	active_command_index++;
	if(active_command!=null)
	{setTimeout(active_command,10);}
	else
	{
		//runNextCommand();
		active_command_index=0;
		checkLevelComplete();
		return;
	}//else.
}//runNextCommand().

function checkLevelComplete()
{
	console.log("checkLevelComplete():");//debug**
	var lightable_blocks = document.body.getElementsByClassName("lightable");
	var lit_blocks = 0;
	for(var b=0; b<lightable_blocks.length; b++)
	{
		var block = lightable_blocks[b];
		if(block.classList.contains("lit"))
		{lit_blocks++;}
	}//for(b).

	console.log("lightable_blocks = "+lightable_blocks.length+" lit_blocks="+lit_blocks);//debug**

	if(lit_blocks<lightable_blocks.length)
	{return;}

	levelComplete();
}//checkLevelComplete().

function levelComplete()
{
	console.log("levelComplete():");//debug**
	var background = document.createElement("DIV");
	background.classList.add("end_screen_background");
	document.body.appendChild(background);

	var game_complete=false;
	if(level_number>=number_of_levels)//these variables defined in .jsp file.
	{game_complete=true;}

	var top_margin = window.innerHeight*0.1;//10%
	var main_message = document.createElement("DIV");
	main_message.classList.add("end_screen_message");
	main_message.style.marginTop=top_margin+"px";
	main_message.style.fontSize=window.innerHeight*0.08;//8%.
	if(game_complete)
	{main_message.innerHTML="Congratulations!";}
	else
	{main_message.innerHTML="Level Complete!";}
	background.appendChild(main_message);

	var sub_message = document.createElement("DIV");
	sub_message.classList.add("end_screen_message");
	sub_message.style.fontSize=window.innerHeight*0.04;//4%.
	if(game_complete)
	{sub_message.innerHTML="You finished the game.";}
	else
	{
		window.addEventListener("keydown",loadNextLevel);
		sub_message.innerHTML="Press space to continue";
	}//else.
	background.appendChild(sub_message);

}//levelComplete().


function loadNextLevel()
{
	console.log("loadNextLevel():");//debug**
	window.location = "lightbot.jsp?level="+(level_number+1);
}//loadNextLevel().