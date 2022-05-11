

function fetcher(url, options)
{
	params = options["params"];
	delete options["params"];
	for(p in params)
	{
		url = appendURL(url, p+"="+params[p]);
	}//for(p).
	//console.log("url = "+url);//debug**

	return fetch(url, options);
}//fetcher().

function appendURL(url, appendage)
{
	if(url.includes("?"))
	{url+="&";}
	else
	{url+="?"}
	
	return url+appendage;
}//appendURL().