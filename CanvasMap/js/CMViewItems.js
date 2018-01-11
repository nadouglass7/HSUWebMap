function CMViewItems(){}CMViewItems.AddNavitationItem=function(TheView,ZoomInPath,HomePath,ZoomOutPath){var TheCanvasContainer=TheView.GetCanvasContainer();var Navigation=document.createElement("DIV");Navigation.className="CM_Navigation";TheCanvasContainer.appendChild(Navigation);Navigation.innerHTML="<table cellpadding='0' cellspacing='0'> \
		<tr> \
			<td width='35px' height='35px' align='center' valign='middle' style='border-bottom:thin solid #999'>   \
				<div id='ZoomIn' > \
				<img class='CM_NavigationImage' src='"+ZoomInPath+"' width='35' height='17' alt='Zoom In'> \
			  </div> \
			  </td> \
		</tr>    \
		<tr> \
			<td width='35px' height='35px' align='center' valign='middle'> \
			<div id='ZoomToMax'  > \
				<img class='CM_NavigationImage' src='"+HomePath+"' width='35' height='17' alt='Home Extent'> \
			</div> \
			 </td> \
		</tr> \
		<tr> \
			<td width='35px' height='35px' align='center' valign='middle' style='border-top:thin solid #999'> \
			 <div id='ZoomOut' > \
				<img class='CM_NavigationImage' src='"+ZoomOutPath+"' width='35' height='17' alt='Zoom Out'> \
			</div>  \
			</td> \
		</tr> \
	</table> ";var ZoomToMaxElement=document.getElementById("ZoomToMax");ZoomToMaxElement.TheView=TheView;ZoomToMaxElement.addEventListener("click",function(TheEvent){this.TheView.ZoomToMaxBounds();});var ZoomInElement=document.getElementById("ZoomIn");ZoomIn.TheView=TheView;ZoomIn.addEventListener("click",function(TheEvent){this.TheView.ZoomIn();return(false);});varZoomOutElement=document.getElementById("ZoomOut");ZoomOut.TheView=TheView;ZoomOut.addEventListener("click",function(TheEvent){this.TheView.ZoomOut();return(false);});}