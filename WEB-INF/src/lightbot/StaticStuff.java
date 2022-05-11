/*
Jon de Bruijn
2022-01-02
Collection of useful generic methods to be imported into any project.
*/

package lightbot;

import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;
import java.util.logging.Logger;
import java.util.HashMap;
import java.util.Set;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.Calendar;
import java.util.Date;
import java.util.Collection;
import java.util.stream.Collectors;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.io.File;
import java.io.BufferedReader;

import java.lang.StringBuilder;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.text.SimpleDateFormat;


public class StaticStuff
{
	private static final String class_name = "StaticStuff";
	private static final Logger log = Logger.getLogger(class_name);

	public static final HashMap<String, String> type_to_extension = new HashMap<String,String>()
	{{
		put("image/jpeg","jpg");
		put("image/avif","avif");
		put("image/bmp","bmp");
		put("image/gif","gif");
		put("image/vnd.microsoft.icon","ico");
		put("image/png","png");
		put("image/svg+xml","svg");
		put("image/tiff","tiff");
		put("image/webp","webp");
	}};

	public static final String root_dir = "/var/lib/tomcat/webapps/lightbot/";
	public static final String image_folder_path = root_dir+"images/";

//Useful generic method for adding to a message.
	public static void appendMessage(String separator, StringBuilder message, String addition)
	{
		if(message.length()>0)
		{message.append(separator);}
		message.append(addition);
	}//appendErrorMessage().

//Use this method for all timestamps (created_date, modified_date).
	public static long getCurrentUTCEpoch()
	{
		Calendar calendar = Calendar.getInstance();
		TimeZone time_zone = TimeZone.getTimeZone("UTC");
		calendar.setTimeZone(time_zone);
		long utc_epoch = calendar.getTimeInMillis();
		return utc_epoch;
	}//getCurrentUTCEpoch().

//Returns int[] with format: [year(eg 1993), month (1-12), date (1-31)].
	public static int[] getUTCDate()
	{
		TimeZone utc_timezone = TimeZone.getTimeZone("GMT");
		Calendar calendar = Calendar.getInstance(utc_timezone);
		int year = calendar.get(Calendar.YEAR);
		int month = calendar.get(Calendar.MONTH)+1;//Calendar class numbers January as 0.
		int date = calendar.get(Calendar.DATE);
		return new int[] {year, month, date};
	}//getUTCDate().

//Converts date int[] to  date int with format: yyyyMMdd.
	public static int convertToDateInt(int[] date_list)
	{
		if(date_list==null || date_list.length<3)
		{return 0;}
		int date_int = (date_list[0]*10000)+(date_list[1]*100)+date_list[2];
		return date_int;
	}//convertToDateInt().

//Uses the 2 above methods to return int with format: yyyyMMdd
	public static int getUTCDateInt()
	{
		return convertToDateInt(getUTCDate());
	}//getUTCDateInt().

//Converts date string with format yyyy-MM-dd to epoch.
	public static long convertDateStringToEpoch(String date_string)
	{
		String[] date_list = date_string.split("-");
		if(date_list.length!=3)
		{
			log.warning(class_name+" convertDateStringToEpoch(): invalid date_string: '"+date_string+"'");
			return 0;
		}//if.
		int year = Integer.parseInt(date_list[0]);
		int month = Integer.parseInt(date_list[1])-1;
		int day = Integer.parseInt(date_list[2]);
		
		Calendar calendar  = Calendar.getInstance();
		calendar.set(year, month, day);

		long epoch = calendar.getTimeInMillis();
		log.info(class_name+" date_string="+date_string+" epoch="+epoch);//debug**
		return epoch;
	}//convertDateStringToEpoch().

	public static boolean deleteFile(String file_path)
	{
		if(file_path==null || file_path.trim().isEmpty())
		{return true;}
		log.info(class_name+" Deleting file ("+file_path+")...");//INFO.
		File file = new File(file_path);
		try
		{
			file.delete();
			return true;
		}//try.
		catch(SecurityException se)
		{
			log.severe(class_name+" Security Exception while trying to delete file ("+file_path+"):\n"+se);
			return false;
		}//catch().
	}//deleteFile().

//Get 'parameter' value from either req.getParameter or req.getHeader, wherever it is defined. 
	public static String extractParameter(HttpServletRequest req, String param_name)
	{
		String param = req.getParameter(param_name);
		if(param==null)
		{param=req.getHeader(param_name);}
		return param;
	}//extractParameter().

//Example method call: StaticStuff.basicRequestReturn(bool, "", null, resp, class_name);      
//Just a useful generic method to return a response to a http request.
	public static void basicRequestReturn(boolean success, String message, JSONObject json_data, HttpServletResponse resp, String origin_class_name)
	{
		if(!success)
		{
			String warning_message = class_name+" basicRequestReturn():"
								+ "\n\torigin_class = "+origin_class_name
								+ "\n\tsuccess = "+success
								+ "\n\tmessage = "+message;
			log.warning(warning_message);
		}//if.

		if(json_data==null)
		{json_data = new JSONObject();}

		json_data.put("success", success);
		json_data.put("message", message);

		System.out.println(class_name+" basicRequestReturn():\n\torigin_class = "+origin_class_name+"\n\t json_data="+json_data.toString());//debug**
		try
		{resp.getWriter().println(json_data.toString());}
		catch(IOException ioe)
		{
			log.info(class_name+" basicRequestReturn(): origin_class="+origin_class_name+" json_data = "+json_data);
			log.severe(class_name+" IO Exception while trying to return data:\n"+ioe);
		}//catch().
	}//basicRequestReturn().

/*	public static boolean validSession(HttpServletRequest req)
	{
		String session_token=null;
		HttpSession sess = req.getSession();
		if(sess.getAttribute("session_token")!=null)
		{session_token = (String)sess.getAttribute("session_token");}
		else
		{session_token = extractParameter(req,"session_token");}
		log.info(class_name+" session_token="+session_token);//debug**
		if(session_token==null || session_token.trim().isEmpty() || !AccessCheck.checkToken(req, session_token))
		{
			return false;
		}//if.
		log.info(class_name+" validSession(): true");//debug**
		return true;
	}//validSession().*/

	public static JSONObject inputStreamToJSON(InputStream input) throws CustomException
	{
		try
		{
			InputStreamReader reader = new InputStreamReader(input);
			JSONParser parser = new JSONParser();
			JSONObject json = (JSONObject)parser.parse(reader);
			return json;
		}//try
		catch(ParseException | IOException ioe)
		{
			throw new CustomException(CustomException.SEVERE, class_name, "Trying to get JSON from InputStream",ioe);
		}//catch.

	}//inputStreamToJSON().


	public static JSONObject makeJSONObject(HashMap<String, String> map)
	{
		JSONObject json = new JSONObject();
		Set<String> keys = map.keySet();
		for(String key: keys)
		{
			json.put(key, map.get(key));
		}//for(key).
		return json;
	}//makeJSONObject().

	public static String inputStreamToString(InputStream input) throws CustomException
	{
		String text = new BufferedReader(new InputStreamReader(input)).lines().collect(Collectors.joining("\n"));
		return text;
	}//inputStreamToString().

	public static void addAll(ArrayList add_to, String[] add_from, int start_index)
	{
		for(int index=start_index; index<add_from.length; index++)
		{add_to.add(add_from[index]);}
	}//addAll().

	public static String getSigFigInt(int number, int sig_figs)
	{
		StringBuilder formatted = new StringBuilder();
		sig_figs--;
		while((sig_figs*10)>number)
		{
			formatted.append("0");
			sig_figs--;
		}//while.
		formatted.append(number);
		return formatted.toString();
	}//getSigFigInt().

	public static double getDecimalPlaces(double number, int places)
	{
		int multiplier = (int)Math.pow(10, places);
		number = Math.round(number*multiplier);
		number = number/multiplier;
		return number;
	}//getDecimalPlaces().

	public static double doubleFromString(String string)
	{
		double result = 0;
		try
		{
			result = Double.parseDouble(string);
		}//try
		catch(NullPointerException | NumberFormatException nfe)
		{
			log.info(class_name+" Exception while trying to get double from '"+string+"':\n"+nfe);
			result=0;
		}//catch.
		return result;
	}//doubleFromString

	public static String replaceNullString(String value)
	{
		if(value==null)
		{return "";}
		return value;
	}//replaceNullString().

	public static void setStatementValue(PreparedStatement stmt, int insert_index, String data_type, String value) throws SQLException
	{
		if(value==null || (value.trim().isEmpty() && (!data_type.equals("text") && !data_type.equals("varchar"))) )
		{
			if(data_type.equals("bigint"))
			{stmt.setNull(insert_index, Types.BIGINT);}
			else if(data_type.equals("text"))
			{stmt.setNull(insert_index, Types.LONGVARCHAR);}
			else if(data_type.equals("int"))
			{stmt.setNull(insert_index, Types.INTEGER);}
			else if(data_type.equals("double"))
			{stmt.setNull(insert_index, Types.DOUBLE);}
			else if(data_type.equals("varchar"))
			{stmt.setNull(insert_index, Types.VARCHAR);}
		}//if
		else
		{stmt.setString(insert_index, value);}
	}//setStatementValue().

	public static String getFormattedDate(String pattern, String epoch_string)
	{return getFormattedDate(pattern, Long.parseLong(epoch_string));}
	public static String getFormattedDate(String pattern, long epoch)
	{
		if(epoch<=0)
		{return "";}
		return getFormattedDate(pattern, new Date(epoch));
	}//getFormattedDate().
	public static String getFormattedDate(String pattern, Calendar calendar)
	{return getFormattedDate(pattern, calendar.getTime());}
	public static String getFormattedDate(String pattern, Date date)
	{
		if(pattern==null || pattern.trim().isEmpty())
		{pattern="dd/MM/yyyy";}
		SimpleDateFormat formatter = new SimpleDateFormat(pattern);
		log.info(class_name+" pattern="+pattern+" formatted_date="+formatter.format(date));//debug**
		return formatter.format(date);
	}//getFormattedDate().


	
}//class StaticStuff.