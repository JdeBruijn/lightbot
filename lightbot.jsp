<%@ page import="java.nio.charset.StandardCharsets" %>
<%@ page import="java.nio.file.Files" %>
<%@ page import="java.nio.file.Paths" %>
<%@ page import="java.io.IOException" %>
<%@ page import="java.lang.SecurityException" %>
<%@ page import="java.util.logging.Logger" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Arrays" %>

<html>

<%
	String base_path = "/var/lib/tomcat/webapps/lightbot";
	String class_name = "\nlightbot.jsp";
	Logger log = Logger.getLogger(class_name);

	String[] levels = {"level1","level2","level3","level4","level5","level6",
						"level7","level8","level9","level10","level11","level12"};
	int number_of_levels=levels.length;


	int level_number = 0;
	String level = "";
	try
	{
		level_number = Integer.parseInt(request.getParameter("level"));
		log.info(class_name+" level_number = "+level_number);//debug**
	}//try.
	catch(NullPointerException | NumberFormatException nfe)
	{level_number=0;}//catch().

	if(level_number>number_of_levels)
	{level_number=0;}

	if(level_number==-1)
	{level="test";}
	else
	{level = levels[level_number];}

	log.info(class_name+" level_number = "+level_number);//debug**
	log.info(class_name+" level = "+level);//debug**

%>

<head>
	<link rel="stylesheet" href="lightbot.css">
	<link rel="stylesheet" href="walking.css">
	<script src="board_creation.js"></script>
	<script src="lightbot.js"></script>
	<script src="fetch_wrapper.js"></script>
	<script src="gameplay.js"></script>
</head>


<body>

	<script>
		var level="<%=level%>";
		var level_number=Number("<%=level_number%>");
		var number_of_levels=Number("<%=number_of_levels%>");
	</script>

	<div id="game_area" class="game_area">

		<div id="instruction_options_bar" class="instruction_options_bar">
			<img id="action_forward" action="forward" class="instruction_option" src="images/action_icons/forward_icon.png" draggable="true" ondragstart="dragActionOption(event)">
			<img id="action_light" action="light" class="instruction_option" src="images/action_icons/light_icon.png" draggable="true" ondragstart="dragActionOption(event)">
			<img id="action_turn_ac" action="turn_ac" class="instruction_option" src="images/action_icons/turn_ac_icon.png" draggable="true" ondragstart="dragActionOption(event)">
			<img id="action_turn_c" action="turn_c" class="instruction_option" src="images/action_icons/turn_c_icon.png" draggable="true" ondragstart="dragActionOption(event)">
			<img id="action_jump" action="jump" class="instruction_option" src="images/action_icons/jump_icon.png" draggable="true" ondragstart="dragActionOption(event)">
			<img id="action_f1_call" action="f1" class="instruction_option" src="images/action_icons/f1_call_icon.png" draggable="true" ondragstart="dragActionOption(event)">
			<img id="action_f2_call" action="f2" class="instruction_option" src="images/action_icons/f2_call_icon.png" draggable="true" ondragstart="dragActionOption(event)">
		</div>

		<div id="control_bar" class="control_bar">
			<div id="run_commands" class="play_button" onclick="pressPlay()"></div>
			<div id="delete" class="delete_area" src="images/trash_icon.png"  ondragover="allowDrop(event)" ondrop="dropActionOption(event)"></div>
		</div>
	</div>


	<div class="instructions_bar">
		<div class="instructions_grid_heading">MAIN</div>
		<div id="base_instructions" class="instructions_grid">
			<div class="instructions_row">
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
			</div>
			<div class="instructions_row">
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
			</div>
			<div class="instructions_row">
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
			</div>
		</div>
		<div class="instructions_grid_heading">P1</div>
		<div id="f1_instructions" class="instructions_grid">
			<div class="instructions_row">
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
			</div>
			<div class="instructions_row">
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
			</div>
		</div>
		<div class="instructions_grid_heading">P2</div>
		<div id="f2_instructions" class="instructions_grid">
			<div class="instructions_row">
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
			</div>
			<div class="instructions_row">
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
				<div class="instruction_cell" ondrop="dropActionOption(event)" ondragover="allowDrop(event)"></div>
			</div>
		</div>
		
	</div>

</body>

<script>
	document.onload = getLevelData();
</script>

</html>
