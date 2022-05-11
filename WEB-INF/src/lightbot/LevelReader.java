
package lightbot;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;
import java.lang.SecurityException;
import java.util.logging.Logger;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;


import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;



public class LevelReader extends HttpServlet
{
	private static final String class_name = "\nLevelReader";
	private static final Logger log = Logger.getLogger(class_name);

	public static final String default_level_name = "test";

	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	{
		returnData(false, "Invalid request method for this url", null, resp);
	}//doPost().

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
	{
		String oper = StaticStuff.extractParameter(req,"oper");
		if(oper.equals("load_level"))
		{loadLevel(req, resp);}
		else
		{returnData(false, "Invalid operation for this url", null, resp);}
	}//doPost().

	private void loadLevel(HttpServletRequest req, HttpServletResponse resp)
	{
		String level_name = StaticStuff.extractParameter(req, "level");
		if(level_name==null || level_name.trim().isEmpty())
		{level_name=default_level_name;}

		log.info(class_name+" level_name = "+level_name);//debug**

		StringBuilder level_data = new StringBuilder();
		try
		{
			List<String> file_rows = Files.readAllLines(Paths.get(StaticStuff.root_dir+"levels/"+level_name+".txt"),StandardCharsets.UTF_8);
			for(String row: file_rows)
			{
				level_data.append(row+"\n");
			}//for(row).
		}//try.
		catch(SecurityException | IOException ioe)
		{
			log.severe(class_name+" Exception while trying to load level '"+level_name+".txt':\n"+ioe);
			returnData(false, "Failed to load level",null, resp);
			return;
		}//catch.

		JSONObject data = new JSONObject();
		data.put("level_data",level_data.toString());
		returnData(true, "", data, resp);
	}//loadLevel().

/*	private JSONArray readLevel(String level_name)
	{
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
	}//readLevel().*/


	protected void returnData(boolean success, String message, JSONObject data, HttpServletResponse resp)
	{
		if(data==null)
		{data = new JSONObject();}

		if(message==null)
		{message="";}
		if(!success)
		{
			log.warning(class_name+" returnData(): success=false\n\tmessage = "+message);
		}//if.

		data.put("success", success);
		data.put("message", message);

		try
		{
			log.info(class_name+" data:\n\t"+data.toString());//debug**
			resp.setContentType("text/json");
			resp.getWriter().println(data.toString());
		}//try
		catch(IOException ioe)
		{log.severe(class_name+" IO Exception while trying to return data:\n"+ioe);}
	}//returnData().

}//class LevelReader.