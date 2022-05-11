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

	String level = request.getParameter("level");
	if(level==null || level.trim().isEmpty())
	{level="test";}

	List<int[][]> map_rows = null;

	try
	{
		List<String> file_rows = Files.readAllLines(Paths.get(base_path+"/levels/"+level+".txt"),StandardCharsets.UTF_8);
		map_rows = new ArrayList<int[][]>(file_rows.size());
		int row_number = 0;
		for(String row_string: file_rows)
		{
			String[] cell_strings = row_string.split("\\|");
			//log.info(class_name+" cell_strings = "+Arrays.toString(cell_strings));//debug**
			int[][] row = new int[cell_strings.length][2];
			for(int c=0; c<cell_strings.length; c++)
			{
				String[] split_data = cell_strings[c].split(",");
				//log.info(class_name+" split_data = "+Arrays.toString(split_data));//debug**
				int height = Integer.parseInt(split_data[0]);
				int lightable = Integer.parseInt(split_data[1]);
				row[c] = new int[] {height, lightable};
			}//for(cell_data).

			map_rows.add(row_number, row);
			row_number++;
		}//for(row_string).
	}//try.
	catch(SecurityException | IOException ioe)
	{log.severe(class_name+" Exception while trying to read level file '"+level+".txt':\n"+ioe);}

	int start_top = 150;
	int start_left= 400;

	double block_width = 60;//60;
	double block_height = 56;//56;

	double height_divisor=2.8;//2.6;
	double width_divisor=2;
	double raiser_divisor=3.5;//4.32;

	double bot_width = block_width;
	double bot_height = block_height*2;

	double bot_start_top=0;
	double bot_start_left=0;
	String[] bot_start_images = {"bot_front_left.png","bot_front_right.png","bot_back_left.png","bot_back_right.png"};
	String bot_start_image=bot_start_images[0];
%>

<head>
	<link rel="stylesheet" type="text/css" href="lightbot.css">
	<script src="lightbot.js"></script>
</head>


<body>
	<div class="game_area">
	
<%
double row_top=start_top;
double row_left=start_left;
for(int[][] row: map_rows)
{
	double curr_top = row_top;
	double curr_left = row_left;
	for(int[] cell: row)
	{
		int stack_size=cell[0];
		int lightable = cell[1];
		double block_top=curr_top;
		for(int ss=0; ss<stack_size; ss++)
		{
			if(lightable>=2)//Bot start position.
			{
				bot_start_top=block_top-(bot_height/1.65);
				bot_start_left=curr_left;
				bot_start_image=bot_start_images[lightable-2];
			}//if.
			if(lightable==1)
			{%><div class="block lightable" style="top:<%=block_top%>px; left:<%=curr_left%>px; height:<%=block_height%>px; width:<%=block_width%>px;"></div><%}
			else
			{%><div class="block" style="top:<%=block_top%>px; left:<%=curr_left%>px; height:<%=block_height%>px; width:<%=block_width%>px;"></div><%}

			block_top-=(block_height/4.32);
		}//for(b).
		curr_top+=(block_height/height_divisor);
		curr_left+=(block_width/width_divisor);
	}//for(cell).
	row_top+=(block_height/height_divisor);
	row_left-=(block_width/width_divisor);
}//for(row).%>

		<img class="bot" src="images/<%=bot_start_image%>" style="top:<%=bot_start_top%>px; left:<%=bot_start_left%>px; height:<%=bot_height%>px; width:<%=bot_width%>px;">

	</div>


	<div class="instructions_bar">
		
	</div>

</body>


</html>
