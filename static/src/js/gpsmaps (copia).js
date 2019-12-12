	var map;
	var geocoder;
	var gMEvent					=undefined;

	var Polyline				=undefined;	
	var Polygon					=undefined;	
	var lineas					=new Array();
	var linea;
	
	var localizacion;		
	var localizaciones			=new Array();
	var localizacion_anterior;
	var vehicle_data			=new Array();
	var locationsMarker 		=new Array();
	var infoGeofences 			=new Array();
	var showGeofences 			=0;
	var device_active			=0;
	var device_random			=0;
	var coordinate_active		=undefined;
	var simulation_action		="stop";
	var simulation_time			=100;
	var simulation_stop			=0;
	var waypts					=new Array();
	var devices_all				=new Array();
	var labels					=new Array();		

	var ida						=new Array();
	var vuelta					=new Array();
	var points_route			="";
	
	var isimulacion				=1;
	var row						={};
    var local                   ={};
odoo.define('gpsmap', function(require){
    "use strict";
    var core = require('web.core');
    var Widget = require('web.Widget');
    
    local.vehicles;
    local.positions=Array();
        
    var rpc = require('web.rpc');

    //////////////////////////////////////////////////////////
    local.gpsmaps = Widget.extend({
        map: function(type) {
            this.vehicles();
            
	        var iZoom       =5;
	        var iMap        ="ROADMAP";
	        var coordinates ={latitude:19.057522756727606,longitude:-104.29785901920393};
	        var object      ="map";	       	        
            CreateMap(iZoom,iMap,coordinates,object);                                   
            if(type=="gpsmaps_maponline")
                this.positions_search();            
        },
        vehicles:function(){
            rpc.query({
                 model: "fleet.vehicle", 
                 method: "search_read",
                 args:[[],[]],
            })
            .then(function (result) {                
                local.vehicles=result;
            });

        },
		vehicles_menu: function()  
		{
            setTimeout(function()
            { 
		        var vehiculos       =local.vehicles;
		        var menu_vehiculo   ="";
		        var opcion_vehiculo ="";
		        var ivehiculos;
		        var icon;
		        		        
		        if(vehiculos!= null && vehiculos.length>0)
		        {
		            for(ivehiculos in vehiculos)
		            {		                
		                var vehiculo        =vehiculos[ivehiculos];		                
                        var vehiculo_id     =vehiculo["id"];
                        var vehiculo_name   =vehiculo["name"];
                                                
			            var image="01";
			            if(!(vehiculo["image_vehicle"]==undefined || vehiculo["image_vehicle"]==false))
			            {
			                image=vehiculo["image_vehicle"];
			            }			
			            icon="/gpsmap/static/src/img/vehiculo_" +image+ "/i135.png";
		                opcion_vehiculo =opcion_vehiculo+"<li class=\"vehicle\" vehicle=\""+vehiculo_id+"\" style=\"padding-left:0px; padding-top:5px; padding-bottom:5px;\"><table><tr><td height=\"17\" width=\"50\" align=\"center\"><img height=\"17\" src=\"" +icon+ "\"></td><td>" + vehiculo_name + "</td></tr></table></li>";		                
		            }	
                
		            if(!$("ul#menu_vehicles").length)	      
		            {
		                opcion_vehiculo ="<li class=\"vehicle vehicle_active\" vehicle=\"0\" style=\"padding-left:0px; padding-top:5px; padding-bottom:5px;\"><table><tr><td height=\"15\" width=\"50\" align=\"center\"></td><td>Todos los vehiculos</td></tr></table></li>"+opcion_vehiculo;
		                opcion_vehiculo="<div class=\"oe_secondary_menu_section\" id=\"vehiculos\"> GPS </div><ul class=\"oe_secondary_submenu nav nav-pills nav-stacked\" id=\"menu_vehicles\" style=\"display:block;\">"+opcion_vehiculo+"</ul>";
		                
		                $("li > a > span:contains('Street Online'):last").parent().parent().append(opcion_vehiculo);  
		            }
		        }
		        else 
		        {
		            setTimeout(function()
                    { 
                        alert("aaa");
    		            this.vehicles_menu();		        
                    },500);    		            
		        }    
           
            },500);
		},
        positions_search:function(){
            rpc.query({
                 model: "gpsmap.positions", 
                 method: "search_read",
                 args:[[],[]],
            })
            .then(function (result) {  
		        var iresult;		
		        		        		        
		        if(result!= null && result.length>0)
		        {
		            for(iresult in result)
		            {		                
		                var positions       =result[iresult];
		                var device          =positions.deviceid;		                
		                
		                //foreach(device);
		                var device_id       =device[0];		                
		                local.positions[device_id]=positions;
                    }
                }                                                              
            });
        },
    });
    //////////////////////////////////////////////////////////
    local.maponline = Widget.extend({
        template: 'gpsmaps_maponline',
        start: function() {       
            var positions;
            var device_id;
            var gpsmaps         =new local.gpsmaps();
            gpsmaps.map("gpsmaps_maponline");
            gpsmaps.vehicles_menu();            

            for(device_id in local.positions)
            {		
                var positions           =local.positions[device_id];
                var device          =positions.deviceid;
			    var v 	={
			        mo:"", 
			        st:"1", 
			        te:"d_telefono",   
			        dn:device[1],
			        ty:"type",
			        na:"name",
			        de:device_id,
			        la:positions.latitude,
			        lo:positions.longitude, 
			        co:positions.course, 
			        mi:"milage", 
			        sp:positions.speed, 
			        ba:"batery", 
			        ti:positions.devicetime, 
			        ho:"icon_online", 
			        ad:positions.address, 
			        ot:positions.other, 
			        im:"01", 
			        ev:"event", 
			        ge:"geofence", 
			        ni:"nivel"
	            };
	            
			    locationsMap(v);				
            }
        }
    });
    core.action_registry.add('gpsmap.maponline', local.maponline);

    //////////////////////////////////////////////////////////
    local.streetonline = Widget.extend({
        template: 'gpsmaps_streetonline',
        start: function() {
            var gpsmaps =new local.gpsmaps();
            gpsmaps.map();
            gpsmaps.vehicles_menu();

            /*
            var panorama = new google.maps.StreetViewPanorama(document.getElementById('street'), panoramaOptions);
            map.setStreetView(panorama);	                
            */
        }
    });
    core.action_registry.add('gpsmap.streetonline', local.streetonline);



});




	/*
	##################################################################
  	### FUNCIONES ESTANDAR
	##################################################################
	*/
	function many2one_get(options)
	{								
		class_one		=options["class_one"];
		class_one_id	=options["class_one_id"];
		class_section	=options["class_section"];
		
		class_field		=options["class_field"];		
		class_field_id	=options["class_field_id"];
		
		class_many		=options["class_many"];
		object			=options["object"];
				
		row["sys_action"]="__SAVE";
		var options_row={
			"class_one":		class_one, 	
			"class_one_id":		class_one_id, 	
			"class_section":	class_section,
			"class_field":		class_field, 						
			"class_field_id":	class_field_id, 			
		};				
		$.ajax(
		{				
			cache:			false,				
			type: 			"GET",  				
			url: 			"../sitio_web/ajax/many2one_get.php",
			data:			{"many2one_json":JSON.stringify(options_row)},														
			success:  function(res)
			{	
				$("#script").html(res);
				
			},		
		});			
	}	
	function many2one_post(options)
	{	
		class_one		=options["class_one"];
		class_one_id	=options["class_one_id"];
		class_field		=options["class_field"];
		class_section	=options["class_section"];
		class_field_id	=options["class_field_id"];
		class_id		=options["id"];
		class_many		=options["class_many"];
		object			=options["object"];		
				
		//alert(class_section);		
		var require="";				
		$("." + class_field).each(function()
		{
			var id			=$(this).attr("id");			

			row[id]		=$(this).val();	 			
			
			if($(this).val()== "")
			{				
				if($("#"+id+"[class*='require']").length>0)
				{						
					require="require";
				}			
			}		
		});
				
		if(require=="")		
		{	
			$("div#create_"+ class_field +" ."+class_field).val("");
						
			row["sys_action"]="__SAVE";
			
			var options_row={
				"class_one":		class_one, 	
				"class_one_id":		class_one_id, 	
				"class_field":		class_field, 			
				"class_section":	class_section,
				"class_field_id":	class_field_id, 
				"class_id":			class_id, 
				"class_many":		class_many,									
				"objet":			object, 												
				"row":				row, 
			};		
			
			$.ajax(
			{				
				cache:			false,				
				type: 			"GET",  				
				url: 			"../sitio_web/ajax/many2one.php",
				data:			{"many2one_json":JSON.stringify(options_row)},														
				success:  function(res)
				{										
					$("#base_"+class_field).html(res);					
				},		
			});						
		}	
		else
		{
			alert("Verifica que los cambos no esten vacios");	
		}	
	}	
	function many2one_report(object, template)
	{				
		if($("td[id='"+ object+"']").html()==undefined)
		{				
			$.ajax(
			{				
				cache:false,
				dataType:"html",
				type: "POST",  
				url: "../"+ template+"report_title.html",
				success:  function(res)
				{											
					$("table[id='"+ object+"']").append(res);
				},		
			});
			$.ajax(
			{				
				cache:false,
				dataType:"html",
				type: "POST",  
				url: "../"+ template+"report_body.html",
				success:  function(res)
				{						
					$("table[id='"+ object+"']").append(res);
				},		
			});
			
		}		
		
	}	
		function sys_report_memory()
		{	
			if($(".sys_report_memory").length>0) 
			{
				$(".sys_report_memory").click(function()
				{					
					var class_field_id			=$(this).attr("class_field_id"); 
					var id						=$(this).attr("id"); 					
					var class_field				=$(this).attr("class_field"); 					
					var data        			=$(this).attr("data");               
										
					var variables				=serializar_url(data);
					var class_one 				=$(this).attr("class_one");     

					var options					={};				
					options["class_one"]		=class_one;					
					options["class_field"]		=class_field;
					options["class_field_id"]	=class_field_id;
					options["id"]				=id;					
					options["object"]			=class_one;
					options["class_many"]		=class_one;						

					for(ivariables in variables)
					{
						if(variables[ivariables]=="write")
							options["class_section"]	=variables[ivariables];	
						if(variables[ivariables]=="delete")
							options["class_section"]	=variables[ivariables];	
					}
										
					many2one_get(options);													
					for(ivariables in variables)
					{
						
						if(variables[ivariables]=="write")
						{
							options["class_section"]	=variables[ivariables];	
							$("div#create_"+ class_field).dialog({
								open: function(event, ui){
									var dialog = $(this).closest('.ui-dialog');
								},
								buttons: {
									"Registrar y Cerrar": function() {								
										many2one_post(options);
										$( this ).dialog("close");
									},
									"Cerrar": function() {
										$( this ).dialog("close");
									}
								},										
								width:"700px"
							});							
						}
						if(variables[ivariables]=="delete")
						{				
							options["class_section"]	=variables[ivariables];	
							enviar = confirm("Borrar datos");														
							if(enviar==true)
							{
								many2one_post(options);	
							}									
						}
					}					
				});
			}	   		
		}	


	function render(origen, destino,diferencia)
	{			
		destino.height(1);
		var alto  =origen.height() + diferencia;
		destino.height(alto);	   
	}	
	function tracert(origen, destino,puntos)
	{			
		var directionsDisplay;
		var directionsService;
		var distanceMatrixService;
	
		directionsService=new google.maps.DirectionsService();
		directionsDisplay=new google.maps.DirectionsRenderer();
		//distanceMatrixService 	= new google.maps.DistanceMatrixService;
			
		var request = {
			origin: 		origen,
			destination: 	destino,
			travelMode: 	google.maps.DirectionsTravelMode["DRIVING"],
			unitSystem: 	google.maps.DirectionsUnitSystem["METRIC"],
		};		
		if(puntos!=undefined)		
		{		
			if(puntos.length>0)		
				request["waypoints"]=puntos;
		}			
		//for(d in directionsService)
		{
			directionsService.route(request, function(response, status) 
			{
				if (status == google.maps.DirectionsStatus.OK) 
				{
					
						directionsDisplay.setMap(map);
						//directionsDisplay.setPanel($("div#text").get(0));
						directionsDisplay.setDirections(response);
						
						//foreach_anidado2(directionsDisplay["directions"]["routes"][0]["legs"]);
						var instrucciones=ruta_pasos(directionsDisplay["directions"]["routes"][0]["legs"]);
						
						if($("#inegi1").length>0) 
						{
							$("#inegi1").val(linea_inegi({make:"IL",punto:origen}));
							$("#inegi2").val(linea_inegi({make:"IL",punto:destino}));														
							//var inegi	=linea_inegi({make:"CR",p1:lineaO,p2:lineaD});
						}	
												
						if($("div#text.instrucciones").length>0) 
						{										
							setTimeout(function()
							{  				
								$("div#text.instrucciones").html(instrucciones);
								$("input#description").val($("div#text.instrucciones").html());																
								
							},200);	
						}	
				} 
				else 	alert("No existen rutas entre ambos puntos");
			});
		}	
	}	
	function linea_inegi(option)
	{					
		var url;
		if(option.make=="IL") 	
		{
			type	="html";
			url		='http://gaia.inegi.org.mx/sakbe/wservice?make=IL&x='+option.punto.lng()+'&y='+option.punto.lat()+'&escala=100000&type=json&key=nDZVnLaZ-vhnO-5V6d-55uO-lwq5Pu6JR65Z'
		}	
		if(option.make=="CR") 	
		{
			type	="json";
			url='http://gaia.inegi.org.mx/sakbe/wservice?make=CR&id_i='+option.p1[0]["id_routing_net"]+'&source_i='+option.p1[0]["source"]+'&target_i='+option.p1[0]["target"]+'&id_f='+option.p2[0]["id_routing_net"]+'&source_f='+option.p2[0]["source"]+'&target_f='+option.p2[0]["target"]+'&p=1&v=1&e=0&type=json&key=nDZVnLaZ-vhnO-5V6d-55uO-lwq5Pu6JR65Z'
		}	
	
		var puntos_inegi=null;		
		$.ajax({
			type: 'GET',
			dataType:type,
			async: false, 
			url: url,
		    success: function(data)   {		puntos_inegi= data;	    }		    
		});	
		return puntos_inegi;
	}
	function ruta_pasos(datos)
	{	
		var tr="";
		var distancia=0;
		var tiempo=0;
		for(d in datos)
		{		
			pasos		=datos[d]["steps"];
			distancia	=distancia + datos[d]["distance"]["value"];
			tiempo		=tiempo + datos[d]["duration"]["value"];
			tr			=tr+"<tr><td colspan='3' height='20'></td></tr>";
			tr			=tr+"<tr><td colspan='2' height='40'>"+datos[d]["start_address"]+"</td><td colspan='1'>"+datos[d]["distance"]["text"]+"</td><td>"+datos[d]["duration"]["text"]+"</td><td></td></tr>";
			
			if($("#datos_ruta").length>0) 
			{
				var costo=datos[d]["distance"]["value"]*40/1000;
				var datos_ruta=datos[d]["distance"]["text"] + " RECORRIDOS EN " + datos[d]["duration"]["text"] + " DEPENDIENDO DE TRAFICO<br>COSTO APROXIMADO " +costo;
				$("#datos_ruta").html(datos_ruta);
			}						
			
			for(p in pasos)
			{
				var instruccion=parseInt(p)+1;
				tr=tr+"<tr><td width='50'>"+instruccion+"</td><td>"+pasos[p]["instructions"]+"</td><td  width='80'>"+pasos[p]["distance"]["text"]+"</td><td width='140'>"+pasos[p]["duration"]["text"]+"</td></tr>";
			}
			if($("#points_route").length>0) 
			{		
				if(typeof datos[d]=="object")
				{
					foreach_anidado2(datos);
				}	
				
			}	
		}	
		var metros		=distancia;
		var kilometros	="";
		var minutos		=parseInt(tiempo/60);
		var duracion	="";
		var recorrido	="";
		if(distancia/1000>0)
		{
			kilometros	=parseInt(distancia/1000);
			var metros	=distancia % 1000;
			kilometros	= kilometros + " Km(s) ";			
		}
		recorrido		= kilometros + metros + " Metro(s)";
		
		if(minutos>59)
		{
			var horas	=minutos/60;	
			var minutos	=(minutos % 60);
			horas		=parseInt(horas);			
			duracion	=horas + " Hora(s) ";
		}
		duracion= duracion + minutos + " Minuto(s)";
		//alert(duracion);
		$("input#campo2.formulario").val(duracion);
		$("input#campo3.formulario").val(recorrido);
		return "<table width='100%'>"+tr+"</table>";
	}
	
	function foreach(datos)
	{
		for(i in datos)
		{				
			alert(i + " ===>>> "+ datos[i]);			
			if(typeof datos[i]=="object")
			{
				foreach(datos[i]);
			}	
		}		
	}
	function foreach_anidado2(datos)
	{
		var anterior;
		var nuevo;
		var medio1;
		var medio2;

		for(i in datos)
		{							
			if(i=="path")
			{			
				var data=datos[i];
				for(ii in data)
				{	
					if(points_route=="")	points_route	=data[ii].lat()+" "+data[ii].lng();
					else					points_route	=points_route + ","+data[ii].lat()+" "+data[ii].lng();							

					/*
					if(anterior==undefined)		
					{
						anterior=data[ii];
					}
					else
					{
						nuevo	=data[ii];
						
						medio1	=LatLng({latitude:nuevo.lat(),longitude:anterior.lng()});
						medio2	=LatLng({latitude:anterior.lat(),longitude:nuevo.lng()});
						
						if(nuevo.lat()>anterior.lat() && nuevo.lng()>anterior.lng()) 				
						{
							ida.push(medio2);
							vuelta.unshift(medio1);
						}	
						else if(nuevo.lat()>anterior.lat() && nuevo.lng()<anterior.lng())
						{
							ida.push(medio1);
							vuelta.unshift(medio2);
						}	
						else if(nuevo.lat()<anterior.lat() && nuevo.lng()>anterior.lng()) 			
						{
							ida.push(medio1);
							vuelta.unshift(medio2);
						}							
						else if(nuevo.lat()<anterior.lat() && nuevo.lng()<anterior.lng()) 			
						{
							ida.push(medio2);
							vuelta.unshift(medio1);
						}													
						anterior=nuevo;
					}
					*/
					
				}		
			}	
			if(typeof datos[i]=="object")
			{
				foreach_anidado2(datos[i]);
			}	
		}
		if($("#points_route").length>0) 
		{				
			$("#points_route").val(points_route);
		}		
		
		//var geofence = ida.concat(vuelta);
		//poligono(geofence,{color:"blue",geofence:"Ocupa fondeport"});	
	}

	function filter_html(field,title,term,name,where)
	{			
		var v_option={
			"LIKE":		"Contiene", 	
			"=":		"Es igual a", 	
			"mayor":	"Mayor", 
			"menor":	"Menor" 			
		};				
		var t_option="";
		for(i_option in v_option)
		{
			var selected="";
			if(where==i_option)		selected="selected";
			t_option	=t_option + "<option " + selected + " value=\"" + i_option + "\">" + v_option[i_option] + "</option>";
		}
		var select="\
			<select id=\"sys_where_" + name +"_" + field + "\" name=\"sys_where_" + name +"_" + field + "\">\
				" + t_option +" \
			</select>\
		";	
	
		var filter="\
			<td id=\"" + field + "_" + term + "\" class=\"total\" valign=\"middle\">\
				<table height=\"28\">\
					<tr>\
						<td id=\"" + field + "_" + term + "\" class=\"mostrar\" style=\"background-color:#555; color:#fff; padding-left:5px; padding-right:5px;\">" + title + "</td>\
						<td style=\"background-color:#555; color:#fff; padding-left:5px; padding-right:5px;\"><div id=\"" + field + "_" + term + "\">" + select + "</div></td>\
						<td style=\"background-color:#aaa; padding-left:5px;\">" + term + "</td>\
						<td id=\"" + field + "_" + term + "\" class=\"filter_close\" style=\"background-color:#aaa;  padding-right:5px;\"><font class=\"ui-icon ui-icon-close\"></font></td>\
					</tr>\
				</table>\
				<input class=\"sys_filter\" type=\"hidden\"id=\"sys_filter_" + name +"_" + field + "\"  name=\"sys_filter_" + name +"_" + field + "\" value=\"" + term + "\">\
				<script>\
					$(\"td#" + field + "_" + term + ".filter_close\").click(function()\
					{\
						$(\"td#" + field + "_" + term + ".total\").remove();\
					});\
					$(\"div#" + field + "_" + term + "\").hide();\
					$(\"td#" + field + "_" + term + ".mostrar\").click(function() {\
						if(	$(\"div#" + field + "_" + term + "\").is(':visible')  ) 	$(\"div#" + field + "_" + term + "\").hide();\
						else $(\"div#" + field + "_" + term + "\").show();\
					});\
				</script>\
			</td>\
		";
		return filter;
	}


	function serializar_url(url)
	{
		var arrUrl 	= url.split("&");
		var varrUrl	= arrUrl.splice(0, 1); 
		
		var urlObj	={};   
		for(var i=0; i<arrUrl.length; i++)
		{
			var x			= arrUrl[i].split("=");
			urlObj[x[0]]	=x[1]
		}
		return urlObj;	
	}	
	function getVarsUrl()
	{
		var url		= location.search.replace("?", "");
		
		var url		= location.href;		
		var arrUrl 	= url.split("&");
		var varrUrl	= arrUrl.splice(0, 1); 
		
		var urlObj	={};   
		for(var i=0; i<arrUrl.length; i++)
		{
			var x			= arrUrl[i].split("=");
			urlObj[x[0]]	=x[1]
		}
		return urlObj;		
		
/*
		$("#action").button({
			icons: {	primary: "ui-icon-document" },
			text: true
		    })
		    .click(function()
		    {
				var variables=getVarsUrl();
				var str_url="";
				for(ivariables in variables)
				{
					if(ivariables=="sys_action")	str_url+="&"+ivariables+"=__SAVE";
					else							str_url+="&"+ivariables+"="+ variables[ivariables];
				}		        
				$("form")
					.attr({"action":str_url})
					.submit();		        
		    }
	    );
	    */	
	}
	function showGeofence()
	{
		if(infoGeofences.length>0) 
		{			
			if(map.getZoom() > 7)
			{
				if(showGeofences==0)
				{
					showGeofences=1;
					for(iG in infoGeofences)
					{				
						var obj_igeo=infoGeofences[iG];				
						obj_igeo.info.open(map,obj_igeo.geofence);
					}
				}	
			}
			else
			{
				if(showGeofences==1)
				{
					showGeofences=0;
					for(iG in infoGeofences)
					{				
						var obj_igeo=infoGeofences[iG];				
						obj_igeo.info.close();
					}
				}				
			}	
		}					
	}
	function action_cancel()
	{
		$("#cancel").button({
			icons: {	primary: "ui-icon-closethick" },
			text: true
		    })
		    .click(function(){
		        //window.location="&sys_section=report&sys_action=";
		        //responsiveVoice.speak("Nissan Versa FTS 41, Exceso de velocidad","Spanish Latin American Female");
		    }
	    );
	}
	function link_report(link)
	{	
		link_base(link,"report","note");
	}
	function link_kanban(link)
	{
		link_base(link,"kanban","newwin");
	}

	function link_base(link,type,image)
	{
		$("#"+type)
		    .button({
			    icons: {	primary: "ui-icon-" + image },
			    text: false
		    })
		    .click(function(){
		        window.location=link;		    
		    }
	    );		
	}
 	function ajustar_menu()
 	{
 		if($("td#system_submenu2").length>0 && $("div#devices_all").length>0) 
	 		render($("td#system_submenu2"), $("div#devices_all"),-50);
				
 	}

 	function ajustar_display()
 	{
 		if($("td#module_body").length>0 && $("div#module_body").length>0) 
 		{
 			//alert(1);
	 		render($("td#module_body"), $("div#module_body"),0);
		}
 		if($("div.report_class").length>0) 
 		{
 			var obj	=$("div.report_class").attr("obj"); 		
	 		{
	 			//alert(2);
	 			render($("div#div_"+obj), $("div#div2_"+obj),-38);		 		
	 		}
			var alto  =$("div#div_"+obj).height() -38;
			//if(alto>60)
			{
				//alert(3);
				$("div#div_"+obj).height(alto);	   
			}	
		}
	 	else
	 	{
	 		//if(alto>60)
	 			//alert(4);
		 		render($("td#module_body"), $("div#module_body"),-20);
		 		
	 	}

 	}
	
	/*
	##################################################################
  	### FUNCIONES GMAPS
	##################################################################
	*/
	
    function CreateMap(iZoom,iMap,coordinates,object) 
    {
	    setTimeout(function()
	    {  
	        if(google!=null)
	        {
              
			    if(iMap=="ROADMAP")	            	var tMap = google.maps.MapTypeId.ROADMAP;
			    if(iMap=="HYBRID")	            	var tMap = google.maps.MapTypeId.HYBRID;								
			    var directionsService;	
			    
			    maxZoomService 						= new google.maps.MaxZoomService();

			    var position		            	=LatLng(coordinates);
			    var mapOptions 		            	= new Object();
	    
			    if(iZoom!="")		            	mapOptions.zoom			=iZoom;
			    if(position!="")	            	mapOptions.center		=position;
			    if(iMap!="")		            	mapOptions.mapTypeId	=tMap;	            
			    
			    mapOptions.ScaleControlOptions		={position: google.maps.ControlPosition.TOP_RIGHT}
			    mapOptions.RotateControlOptions		={position: google.maps.ControlPosition.TOP_RIGHT}
			    mapOptions.zoomControlOptions		={position: google.maps.ControlPosition.TOP_RIGHT};
			    mapOptions.streetViewControlOptions	={position: google.maps.ControlPosition.TOP_RIGHT}
			    
			    
			    mapOptions.styles					=	[
			    {
				    "featureType":"water",
				    "stylers":[
					    {"hue":"#000066"},
				    ]
			    },
			    {
				    "featureType":"water",
				    "elementType":"labels.text.fill",
				    "stylers":[
					    {"hue":"#007fff"},
					    {"gamma":0.77},
					    {"saturation":65},
					    {"lightness":99}
				    ]
			    },
			    {
				    "featureType":"water",
				    "elementType":"labels.text.stroke",
				    "stylers":[
					    {"gamma":0.11},
					    {"weight":5.6},
					    {"saturation":99},
					    {"hue":"#0091ff"},
					    {"lightness":-86}
				    ]
			    },
			    {
				    "featureType":"poi.park",
				    "stylers":[
					    {"hue":"#00ff00"}
				    ]
			    },];
				    
			    map 								= new google.maps.Map(document.getElementById(object), mapOptions);        
			    geocoder 		   					= new google.maps.Geocoder();      
			    var trafficLayer 					= new google.maps.TrafficLayer();						
      			trafficLayer.setMap(map);
      					    
      					    
      			
			    gMEvent                         	= google.maps.event;
			    
			    $("#buscar_address").button({
				    text: false
				    })
				    .click(function(){
					    codeAddress($("#address").val());
				    }
			    );
		    }
		    else 
		    {
		        CreateMap(iZoom,iMap,coordinates,object);	    
		    }    
	    },50);	
    }
	function polilinea(LocationsLine,color)
	{	
		if(color==undefined)	var color="#FF0000";
		if(color=="") 			var color="#FF0000";
		
		Polyline = new google.maps.Polyline({
			path: LocationsLine,
			geodesic: true,
			strokeColor: color,
			
			strokeOpacity: 1.0,
			strokeWeight: 2
		});		
		Polyline.setMap(map);
		lineas.push(Polyline);
	} 
	function poligono(LocationsLine,option) 
	{	
		if(option==undefined)			option={};
		if(option.color==undefined)		option.color="#FF0000";		
		if(option.color=="") 			option.color="#FF0000";
		
		if(option.opacity==undefined)	option.opacity=0.8;		
		if(option.opacity=="") 			option.opacity=0.8;
		
		
		
		Polygon = new google.maps.Polygon({
			paths: LocationsLine,
			strokeColor: option.color,
			strokeOpacity: option.color,
			strokeWeight: 2,
			fillColor: option.color,
			fillOpacity: 0.35
		});	
				
	
		if(option.geofence!=undefined)
		{
			var total_lat=0;
			var total_lng=0;
			var may_lat=0;
			for(iLocationsLine in LocationsLine)
			{	
				if(LocationsLine[iLocationsLine].lat>may_lat)
				{ 
					may_lat= LocationsLine[iLocationsLine].lat
					may_lng= LocationsLine[iLocationsLine].lng
				}	
				
				total_lat =total_lat + LocationsLine[iLocationsLine].lat;
				total_lng =total_lng + LocationsLine[iLocationsLine].lng;																						
			}
			
			may_lat=may_lat - 0.00005;
			
			iLocationsLine			=parseInt(iLocationsLine)+1;
			
			var t_lat				=(total_lat / (iLocationsLine));
			var t_lng				=total_lng / (iLocationsLine);

			var posicion 		    = LatLng({latitude:t_lat,longitude:t_lng});						    	
		
			var mapLabel = new MapLabel({
				text: 			option.geofence,
				position: 		posicion,
				map: 			map,
				fontSize: 		14,
				fontColor:		"#000000",
				align: 			"center",
				strokeWeight:	5,
			});

		}			
		
		Polygon.setMap(map);
	} 	   
	function map_info(objeto)  
	{
		return new google.maps.InfoWindow(objeto);				
	} 
	
	function LatLng(co)  
	{
		return new google.maps.LatLng(co.latitude,co.longitude);
	} 
    function centerMap(marcador)
	{
		map.panTo(marcador);		
	}
	function hablar(item)
	{
		var evento;
		if(!(item["ev"]==undefined || item["ev"]==false || item["ev"]=="false"))
        {        	
			evento 		= item["ev"];
			event		=evento.substring(0, 6);
		}			
		if(!(item["ev"]==undefined || item["ev"]==false || item["ev"]=="false" || event=="REPORT" || event=="Report"))
        {        
        	//var res = str.substring(1, 4);

			var obj=$("table.select_devices[device="+item["de"]+"]");

			device_active			=obj.attr("device");	
			
			ajax_positions_now("../sitio_web/ajax/map_online.php");
			$(".select_devices").removeClass("device_active");
			$(obj).addClass("device_active");
		
			var actualiza="no";
		    status_device(actualiza, obj);

        
            var fechaactual = item["ti"].split(" ");  
            	
        	var voz=item["dn"] + " reporta " + fechaactual[1];
        	if(!(item["ev"]==undefined || item["ev"]==false || item["ev"]=="false"))
        		voz=voz + ", " + item["ev"];
		    if(!(item["ad"]==undefined || item["ad"]==false || item["ad"]=="false"))       
				voz=voz + ", " + item["ad"];
				
				
		    	$("#message").html(voz)
		    	.dialog({
					show: {
						effect: "shake",
						duration: 750
					},		    			    	
		    		width:"350",
		    		modal: true,
		    	});
				setTimeout(function() 
				{
					$("#message").dialog("close")
				}, 2500 );

        	responsiveVoice.speak(voz,"Spanish Latin American Female");            	
        }		
	}
	
    function odometro(item)	 
    {    	
    	if(item["ot"]["battery"])			item["ba"]  =item["ot"]["battery"];
    	else								item["ba"]  =0;
    	if(item["al"])						item["al"]  =item["al"];
    	else								item["al"]  =0;
    	
		//if(item["ot"]["battery"])			item["ga"]  =item["ot"]["battery"];
		var gas;
    	if(item["ot"]["io3"])				
    	{
    		gas								=item["ot"]["io3"];
    		item["ga"]  					=parseInt(gas.substring(0,3));
    		
    		//item["ga"]  					gas.substring(1,3);
    	}	
    	else								item["ga"]  =0;
		
		
		
    	//if(item["ot"]["io3"])				item["ga"]  =item["ot"]["io3"];
    	//else								item["ga"]  =0;

    	if(item["ot"]["ip"])				item["ip"]  =item["ot"]["ip"];
    	else								item["ip"]  =undefined;
    	

		/*    	
    	if(item["ot"]["totalDistance"]>0)	
    		item["mi"]  =parseInt(item["ot"]["totalDistance"]/1000);

    	if(item["ot"]["odometer"]>0)		
    		item["mi"]  =parseInt(item["ot"]["odometer"]/1000);    	

    	*/
    	
    	if(item["ts"])						item["ts"]  =item["ts"];
    	else								item["ts"]  =1.852;
    	

    	if(item["ba"]>100) item["ba"]=125;    
        var bat=item["ba"]*12/12.5-110;
        $("path.bateria").attr({"transform":"rotate("+ bat +" 250 250)"});            
        
        var vel=item["sp"]*item["ts"]*12/10-110;  // 
        $("path.velocidad").attr({"transform":"rotate("+ vel +" 250 250)"});
        
        var alt=item["ga"]*12/10-38;
        $("path.altitude").attr({"transform":"rotate("+ alt +" 250 250)"});            

        $("#millas").html(item["mi"]);

        var tablero1="";
        var tablero2="";

		///*        
        if(item["st"]=="-1" && item["mo"]!="map")	//tiempo
        {
		    if(item["ni"]<=10)
	            tablero1= tablero1 + " :: EMPRESA PRE-BLOQUEADA :: ";
	        else
	        	alert("EMPRESA PRE-BLOQUEADA"); 
        }
        //*/
                        
        if(!(item["ti"]==undefined || item["ti"]==false || item["ti"]=="false"))	//tiempo
            tablero1= tablero1 + item["ti"];
        if(!(item["ge"]==undefined || item["ge"]==false || item["ge"]=="false"))        
            tablero1= tablero1 + " :: " + item["ge"];
  
        if(!(item["ev"]==undefined || item["ev"]==false || item["ev"]=="false"))	//evento
            tablero2= " :: " + item["ev"];
        
		
        if(!(item["ad"]==undefined || item["ad"]==false || item["ad"]=="false"))       
            tablero2= "UBICACION :: " + item["ad"] + tablero2;          
                       
        if(item["ni"]<=40)
        {
			var tablero="\
				<table>\
					<tr><td width=\"40\"  style=\"color:#fff;\"><a href=\"#\"onclick=\"command_device('Bloquear motor'," + item["de"] +")\"><img width=\"32\" src=\"../sitio_web/img/swich_off.png\"></a></td>\
					<td style=\"color:#fff;\"><a href=\"tel:" + item["te"] +"\">" + tablero1 + "</a></td></tr>\
					<tr><td width=\"40\"  style=\"color:#fff;\"><a href=\"#\"onclick=\"command_device('Activar motor'," + item["de"] +")\"><img width=\"32\" src=\"../sitio_web/img/swich_on.png\"></a></td>\
					<td style=\"color:#fff;\">" +tablero2 + "</td></tr>\
				</table>\
			";	
		}
		else
		{	
			var tablero="\
				<table>\
					<tr><td width=\"40\"  style=\"color:#fff;\"></td>\
					<td style=\"color:#fff;\">" + tablero1 + "</td></tr>\
					<tr><td width=\"40\"  style=\"color:#fff;\"></td>\
					<td style=\"color:#fff;\">" +tablero2 + "</td></tr>\
				</table>\
			";	
		}	
        $("#tablero").html(tablero);
    }

	function locationsMap(vehicle, type)
	{	
		if(type==undefined)     type="icon";
		else                    type="marker";

		if(vehicle["st"]==undefined)	vehicle["st"]="1";
		if(vehicle["st"]=="")			vehicle["st"]="1"; 
		if(vehicle["mo"]=="map")		vehicle["st"]="1";
		
		//alert(vehicle["mo"]);
	    //alert(vehicle["st"]);		
		if(vehicle["st"]=="1" || vehicle["st"]=="-1")
		{		
			var device_id=vehicle["de"];
			
			if(localizacion_anterior==undefined)	
			{
				localizacion_anterior=new Array();				
				localizacion_anterior[device_id]={ti:"2000-01-01 00:00:01"}			
			}
			if(localizacion_anterior[device_id]==undefined)	
			{
				localizacion_anterior[device_id]={ti:"2000-01-01 00:00:01"}			
			}									
			
			if(vehicle["se"]=="historyMap" || vehicle["ti"] >= localizacion_anterior[device_id]["ti"])
			{
			    //alert("1");
				//if(vehicle["ti"] > localizacion_anterior[device_id]["ti"] && vehicle["se"]!="simulator")
				//	hablar(vehicle);
				localizacion_anterior[device_id]=vehicle;
			
				var coordinates			={latitude:vehicle["la"],longitude:vehicle["lo"]};
	
				$("table.select_devices[device="+ vehicle["de"] +"]")
					.attr("lat", vehicle["la"])
					.attr("lon", vehicle["lo"]);
					
				icon_status="";	
				if(vehicle["ty"]=="alarm")				icon_status="sirena.png";
				if(vehicle["ty"]=="deviceStopped")		icon_status="stop.png";
				if(vehicle["ty"]=="deviceMoving")		icon_status="car_signal1.png";
				if(vehicle["ty"]=="deviceOnline")		icon_status="car_signal1.png";
				if(vehicle["ty"]=="deviceOffline")		
				{
					icon_status="car_signal0.png";
					if(vehicle["ho"]==1)	icon_status="car_signal1.png";
				}	
				if(vehicle["ty"]=="ignitionOn")			icon_status="swich_on.png";
				if(vehicle["ty"]=="ignitionOff")		icon_status="swich_off.png";
				
				if(vehicle["sp"]<5 && vehicle["ty"]=="deviceOnline")	icon_status="stop.png";
				if(vehicle["sp"]>5 && vehicle["ty"]=="deviceOnline")	icon_status="car_signal1.png";
				
				
				if(icon_status!="")
				{
					img_icon="<img width=\"20\" title=\""+ vehicle["ty"] +"\" src=\"../sitio_web/img/"+ icon_status +"\" >";
					$("table.select_devices[device="+ vehicle["de"] +"] tr td.event_device").html(img_icon);
				}	
			
				var icon        		=undefined;
				
				var posicion 		    = LatLng(coordinates);						    	
				if(type=="icon")
				{				    
					var marcador;
					if(vehicle["co"]==undefined)        vehicle["co"]	=1;
					if(vehicle["co"])                   icon    		=vehicle["co"];
					
					if(icon>22 && icon<67)	icon=45;
					else if(icon<112)		icon=90;
					else if(icon<157)		icon=135;
					else if(icon<202)		icon=180;
					else if(icon<247)		icon=225;
					else if(icon<292)		icon=270;
					else if(icon<337)		icon=315;
					else					icon=0;		

					var image="01";
					if(!(vehicle["im"]==undefined || vehicle["im"]==false))		image	=vehicle["im"];

					//icon	="../sitio_web/img/car/vehiculo_" +image+ "/i"+icon+ ".png";		    
					icon="/gpsmap/static/src/img/vehiculo_" +image+ "/i"+icon+ ".png";		    
					if(labels[device_id]==undefined)	
					{
					    //alert("label");
					    /*
						labels[device_id]=new MapLabel({
							text: 			vehicle["dn"],
							posi    tion: 		posicion,
							map: 			map,
							fontSize: 		14,
							fontColor:		"#8B0000",
							align: 			"center",
							strokeWeight:	5,
						});
						*/
					}
					//alert("2");
					//labels[device_id].set('position', posicion);
			
					if(device_active==vehicle["de"] && vehicle["se"]==undefined || vehicle["se"]=="simulator") 
					{
					    	
					    centerMap(posicion);			
					    odometro(vehicle);
					} 
				}
				var icon        		=undefined;
				
				var marcador 		    = markerMap(posicion, icon);		
					
				//var infowindow 		    = messageMap(marcador, vehicle);
		
				fn_localizaciones(marcador, vehicle);
			}
			else
			{
				//alert(vehicle["ti"] + ">"+ localizacion_anterior[device_id]["ti"]);
			}					
		}
		else 
		{
			var marcador 		    =undefined;
			
			var tablero="<table><tr><td style=\"color:red;\"><b>Los vehiculos se encuentran bloqueados</b></td></tr><tr><td style=\"color:#fff;\">Favor de contactar con el administrador del sistema</td></tr></table>";	
    	    $("#tablero").html(tablero);			
		}
		return marcador;
	}
	function markerMap(position, icon, markerOptions) 
	{
		if(markerOptions==undefined)	var markerOptions 			= new Object();
				
		markerOptions.position		=position;
		markerOptions.map			=map;
		//if(icon!=undefined)
		//	markerOptions.icon		=icon;
		
		
		var marker2=new google.maps.Marker(markerOptions);
		alert(marker2);
		
		
		//foreach(marker2);
		return marker2
	}
    function codeAddress(address,city,country) 
    {
    	var txt_address="";
    	if(country!=undefined)	txt_address+=country+", ";
    	if(city!=undefined)		txt_address+=city+", ";
    	if(address!=undefined)	txt_address+=address;
    	
        geocoder.geocode({'address': txt_address}, 
        function(results, status) 
        {
            if (status == google.maps.GeocoderStatus.OK) 
            {
                map.setCenter(results[0].geometry.location);
                map.setZoom(17);

                markerMap(results[0].geometry.location,undefined);
            } 
            else 	alert('Geocode was not successful for the following reason: ' + status);

        });
    }

    function ajax_positions_now(link,time)
    {    	
    
    	if(link==undefined)		link="../sitio_web/ajax/map_online.php?refresh=";
    	if(time==undefined)		time=0;
    	
	    setTimeout(function()
	    {  
			$.ajax(
			{
				async:true,
				cache:false,
				dataType:"html",
				type: "POST",  
				url: link,
				success:  function(res)
				{				    	
				    $("#script").html(res);
				}
			});    
		},time);    	
    }
    function ajax_positions(link,time)
    {
    	if(time==undefined)		time="15000";
    	if(link==undefined)		link="../sitio_web/ajax/map_online.php?refresh=";

        timer_position=setInterval(function()
        {     
			ajax_positions_now(link);
        },time);
    }    
    
    function fn_localizaciones(position, vehiculo)
    {
    	var ivehiculo=vehiculo["de"];
		if(localizaciones[ivehiculo]==undefined)     	
		{
			localizaciones[ivehiculo]	=Array(position);
			if(vehiculo["se"]!="simulator")    	vehicle_data[ivehiculo]		=Array(vehiculo)
		}	
		else
		{
			localizaciones[ivehiculo].unshift(position);			
			if(vehiculo["se"]!="simulator")     vehicle_data[ivehiculo].unshift(vehiculo)
		}	
    }    
	function del_locations(borrar)  
	{			    
		if(borrar==undefined)	borrar="si";
        if(localizaciones.length>0)                
        {
            for(idvehicle in localizaciones)
            {
                var positions_vehicle			= localizaciones[idvehicle];                    
                if(positions_vehicle.length>0)                
                {
                    for(iposiciones in positions_vehicle)
                    {    
                        //if(iposiciones>0)
                        {	
	                    	localizaciones[idvehicle][iposiciones].setVisible(false);								
                    		localizaciones[idvehicle][iposiciones].setMap(null);                     
                        	//if(iposiciones>0)	                        	localizaciones[idvehicle]=[]; 
	                    } 	                    
                    }                    
                }
            }

        }
        
	}

	function messageMaps(marcador, vehicle, infowindow) 
	{
		gMEvent.addListener(marcador, 'click', function() 
		{
		    device_active=vehicle["de"];
		    		    		    
			$(".select_devices").removeClass("device_active");
			$(".select_devices[device="+ vehicle["de"] +"]").addClass("device_active");			
			
			if(vehicle["se"]=="historyMap")	infowindow.open(map,marcador);
			else							status_device();
		});							
	}
	function paint_history(iposiciones, section)
	{			    
        if(vehicle_data[device_active].length>isimulacion)                
        {        	
        	localizacion_anterior=undefined;
	    	var vehicle			=vehicle_data[device_active][isimulacion];	    	
	    		    	
	    	if(vehicle["sp"]>4)	
	    	{
	    		simulation_stop=0;
	    		simulation_time=600;
	    	}	
	    	else	
	    	{
					if(simulation_stop<20)
					{
						simulation_stop=simulation_stop+1;
						if(simulation_time==600)    simulation_time=300;
					}	
					else
					{
						if(simulation_time==300)	simulation_time=5;
					}	
	    	}	
	    	
	    	vehicle["se"]		="simulator";
	    	locationsMap(vehicle); 
	    	if(section=="historyStreet")			execute_streetMap(vehicle);
            setTimeout(function()
            {   
            	if(simulation_action!="pause")		                                            		    	
	            	del_locations();
            	isimulacion=isimulacion+1;
            	if(simulation_action=="play")		
            		paint_history(isimulacion, section);
            },simulation_time);
        }
	}
	function dateTimes()
	{
		$('#fInicio').datetimepicker({
			dateFormat: "yy-mm-dd",
			timeFormat: 'HH:mm:ss',
			changeMonth: false,
			changeYear: false,
			currentText: "Ahora",
			closeText: "Listo",
			showSecond: false,			
			showMillisec:false,
			showMicrosec:false,
			showTimezone:false,
			dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
			monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
		});

		$('#fFinal').datetimepicker({
			dateFormat: "yy-mm-dd",
			timeFormat: 'HH:mm:ss',
			changeMonth: false,
			changeYear: false,
			currentText: "Ahora",
			closeText: "Listo",
			showSecond: false,			
			showMillisec:false,
			showMicrosec:false,
			showTimezone:false,
			dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
			monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
		});	
		
	}

	function butons_simulation()
	{
		var butons_html=" \
			<font id=\"back\"> -- </font>\
			<font id=\"play\">Play</font>\
			<font id=\"pause\">Pause</font>\
			<font id=\"stop\">Stop</font>\
			<font id=\"next\"> ++ </font>\
		";
		$("#tablero2").html(butons_html);
		$("#tablero").html("");
	
	    $("#play").button({
			icons: {
				primary: "ui-icon-play"
			},
			text: false
			})
			.click(function()
			{			    
				if(localizaciones.length>0)                
				{
				    simulation_action="play";
				    del_locations();
				    $("div#odometro").show();
					paint_history(isimulacion, historyMap);
				}    					
			}
		);
	    $("#pause").button({
			icons: {
				primary: "ui-icon-pause"
			},
			text: false
			})
			.click(function()
			{			    
			    simulation_action="pause";
			}
		);
		
	    $("#next").button({
			icons: {
				primary: "ui-icon-seek-next"
			},
			text: false
			})
			.click(function()
			{
				if(simulation_time>=50)
					simulation_time=simulation_time-50;
			}
		);
	    $("#back").button({
			icons: {
				primary: "ui-icon-seek-prev"
			},
			text: false
			})
			.click(function()
			{
				simulation_time=simulation_time+50;
			}
		);				
	    $("#stop").button({
			icons: {
				primary: "ui-icon-stop"
			},
			text: false
			})
			.click(function()
			{
				isimulacion=1;
				simulation_action="stop";
			}
		);		
	
	}
	
	
    function status_device(actualiza, obj)
    {	    	
        if(device_active==undefined)    device_active	=0;        
        if(obj!=undefined)
        {	        	
        	var lat	=$(obj).attr("lat");
        	var lon	=$(obj).attr("lon");        	
        	if(lat!=undefined)
        	{
				var coordinates={latitude:lat,longitude:lon};
		    	var posicion		=LatLng(coordinates);
			    centerMap(posicion);
			}
        }    
		if(device_active==0)	
		{
			$("div#map_search").show();
			$("div#odometro").hide();
			$("#tablero").html("Estatus : Seleccionar un vehiculo");			
			$("#tablero").animate({				
				height: 25
			}, 1000 );			
		}	
		else
		{
			map.setZoom(16);
			$("#tablero").animate({				
				height: 58
			}, 1000 );
			$("#tablero").html("<h4>Cargando...</h4> <img id=\"loader1\" src=\"../sitio_web/img/loader1.gif\" height=\"30\" width=\"30\"/>");	
			//status_device2();
			$("#odometro").show(); 
			$("div#map_search").hide();
		}	  			
	}
	
	function execute_streetMap(vehicle)
	{
		if($("div#street").length>0)
		{
			var coordinates						={latitude:vehicle["la"],longitude:vehicle["lo"]};
		
			if(coordinate_active==undefined)	coordinate_active={};
			var txt_active						=coordinate_active["latitude"]+","+coordinate_active["longitude"];
			var txt_history						=coordinates["latitude"]+","+coordinates["longitude"];

			var txt 							= txt_active + " " +txt_history;
			//$("#pie").html(txt);
		
			if(txt_active!=txt_history)
			{	
				coordinate_active				=coordinates;
				var posicion					=LatLng(coordinates);
				
				centerMap(posicion);
				var curso           			=vehicle["co"];		        
				var panoramaOptions = {
				    position: posicion,
				    pov: {
				      heading:  curso,
				      pitch:    10
				    }
				};
				
				var panorama = new google.maps.StreetViewPanorama(document.getElementById('street'), panoramaOptions);
				map.setStreetView(panorama);	                		    
			}        
		}	
	}


	
	$(document).ready(function()
	{
		setTimeout(function()
		{  	
			ajustar_display();
			ajustar_menu();			
			
		},1000);
		
	
		var vURL = window.location.href
		var aURL = vURL.split("/");
		var	vURL = aURL[aURL.length-2]+"/"+aURL[aURL.length-1];
		
		$(".submenu2").removeClass("submenu2_active");
		
		/*
		$(".submenu2").click(function(e)
		{				
			vLINK = $(this).parents( "a" ).attr('href');
			aLINK = vLINK.split("/");
			vLINK = aLINK[aLINK.length-2]+"/"+aLINK[aLINK.length-1];	
			if(vURL == vLINK)
			{
			    e.stopPropagation();
			    e.preventDefault();			
			}					    					    			
		});
		*/
	    if($(".base_report").length>0)
	    {
	    	var origen=$(".base_report");	    	
	    	var id=origen.attr("id");	    	
	    	var destino=$(".base_report").children(".div_report");
	    
			render(origen, destino,-39);
		}
	    if($("div.submenu").length>0)
	    {
			$("div.submenu").click(function()
			{
                var active        =$(this).attr("active");               
                $("div.option").removeClass("d_block");                
				$("div.option[active='"+active+"']").addClass("d_block");
				
				ajustar_menu();
			});
		}
	    if($("font.show_form").length>0)
	    {
			$("font.show_form").click(function()
			{
                var active	=$(this).attr("active");                
                $("#form_"+active).removeClass("d_none");
				$("#form_"+active).addClass("d_block");				
			});
		}
		
	    $("div#setting").hide();
	    
	    if($("font#update_settings").length>0)
	    {
			$("font#update_settings").button({	    
				icons: {	primary: "ui-icon-refresh" },
				text: true
				})
				.click(function()
				{				
					$("div#setting").dialog("destroy");
					var setting_company = $("input#setting_company").val();
				
					$.ajax(
					{
						async:true,
						cache:false,
						dataType:"html",
						type: "POST",  
						url: "../modulos/sesion/ajax/index.php",
						data: "setting_company="+setting_company,
						success:  function(res)
						{					
							$("#script").html(res);
						}
					});    														
					$("form").submit();		        
				}
			);			    
		}	    
	    if($("#varias_hojas.form").length>0)
	    {
	    

				$( "#varias_hojas.form" ).tabs();
		}
	    $("font#setting").click(function(){
	        $("div#setting").dialog({
	        	width:"700px"
	        });
	    });
	    if($("img#excel").length>0)
	    {
			$("img#excel").click(function()
			{
				var url		= location.href;		
				var arrUrl 	= url.split("/");
				
				var clase	=arrUrl[ arrUrl.length -2 ];				

				$("form")
					.attr("target","_blank")
					.attr("action","&sys_action=print_excel")
					.submit();
				$("form").attr("action","");
					
		    });	        
	    }	    
	    if($("img#pdf").length>0)
	    {
			$("img#pdf").click(function()
			{
				var url		= location.href;		
				var arrUrl 	= url.split("/");
				
				var clase	=arrUrl[ arrUrl.length -2 ];
				var str_get	="";								

				$(".modulo_principal").each(function()
				{
					str_get	+="&" + $(this).attr("id") + "=" +$(this).val();			
				});

				$("form")
					.attr("target","_blank")
					.attr("action","&sys_action=print_pdf"+str_get)
					.submit();
				$("form")
					.attr("action","")
					.removeAttr("target");
		    });	        
	    }	    

	    if($("img#print").length>0)
	    {
			$("img#print").click(function()
			{
				var url		= location.href;		
				var arrUrl 	= url.split("/");
				
				var clase	=arrUrl[ arrUrl.length -2 ];				

				$("form")
					.attr("target","_blank")
					.attr("action","&sys_action=print_report")
					.submit();
				$("form")
					.attr("action","")
					.removeAttr("target");

		    });
	    }	    
	   
    	if($(".sys_report").length>0) 
    	{
            $(".sys_report").click(function()
            {
            	var enviar		=true;
            	var data        =$(this).attr("data");               
            	var variables	=serializar_url(data);
            	var path		="";
				for(ivariables in variables)
				{
					path=set_var(ivariables, variables[ivariables]);
				
					if(variables[ivariables]=="delete")							
					{
						enviar = confirm("Borrar datos");														
					}	
				}	
				if(enviar==true)
				{
					if(path!="")	$("form").attr({"action":path});					
					$("form").submit(); 	        
				}		
			});
		}	    
        if($(".sys_order").length>0)
        {
            $(".sys_order").click(function()
            {
            	
                var name        =$(this).attr("name");
                var sys_order   =$(this).attr("sys_order");                
                var sys_torder  =$(this).attr("sys_torder");
                
                                
	            $("#sys_order_"+name).val(sys_order);
	            $("#sys_torder_"+name).val(sys_torder);
	            
	            $("form").submit(); 
             });               
        }
      

		if($(".cKanban").length>0) 
		{
			var colorAction;
			var colorKanban;
			var colorHover;

			$(".cKanban").mouseover(function()
			{					
				$(this).find(".cBotones").css("display", "block");

				if($(this).find("[type=checkbox]").is(':checked'))
				{
				}
				else
				{					
					colorKanban	=$(this).css("background-color");
					$(this).css("background-color", "#EFEFFB");
					colorHover	=$(this).css("background-color");
				}
				
			});
			$(".cKanban").mouseout(function()
			{				
				$(this).find(".cBotones").css("display", "none");
				if ($(this).css("background-color") == colorHover)
				{
					$(this).css("background-color", colorKanban);
				}
			}); 
			$(".cAction").mouseover(function()
			{
				colorAction	=$(this).css("background-color");
				$(this).css("background-color", "#A4A4A4");

			});
			$(".cAction").mouseout(function()
			{
				$(this).css("background-color", colorAction);
			});		   
		
			$("[type=checkbox]").click(function() {  //input.myclass[type=checkbox]   
	        if($(this).is(':checked')) { 
	            $(this).parents( ".cKanban" ).css( "background","#58FAF4"); 
	        } else {  
	            $(this).parents( ".cKanban" ).css( "background", colorKanban); 
	        }  
	    	});

		}
	    if($(".echo").length>0)
	    {
			$(".echo").dialog();
		}		
	    if($(".developer").length>0)
	    {
			$(".developer").dialog();
		}		

		if($(".cBodyReport").length>0) 
		{
			var colorAction;
			var colorRowOdd = $(".odd").css( "background-color");	
			var colorRowEven = $(".even").css( "background-color");
			var classRow;

			$(".cAction").mouseover(function()
			{
				colorAction	=$(this).css("background-color");
				$(this).css("background-color", "#58FAF4");	

			});
			$(".cAction").mouseout(function()
			{
				$(this).css("background-color", colorAction);
			});		   
		
			$(".view_report:checkbox").click(function() 
			{  
			    if($(this).is(':checked')) 
			    { 	        	
			        $(this).parents( "tr" ).css( "background-color","#58FAF4");
			    } 
			    else 
			    {  

			        classRow = $(this).parents( "table" ).parents( "tr" ).attr('class');
			        
		        	if(classRow == "odd")
		        	{
		        		$(this).parents( "tr" ).css( "background-color",colorRowOdd);
		        	}
		        	else if (classRow == "even") 
		        	{
		        		$(this).parents( "tr" ).css( "background-color",colorRowEven);
		        	};	            
			    }  
	    	});

		}
		
		/*
		if( isMobile.any() ) alert('Mobile');		
		else	alert('NO Mobile');
		
		/*
		if($.browser.device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())))
		{
			alert("CELULAR");
			$("form").attr({"style":"width:700px;"});
		}
		*/		


	    if($("td#system_submenu2").length>0)
	    {
	    	ajustar_menu();
			$( window ).resize(function() 
			{
				ajustar_menu();
				ajustar_display();
			});	   	   
	    }

    });	
		
	function set_var(variables, ivariables)
	{
		var path="";
		if($("select#"+variables).length>0)
		{
			if($("select#"+variables+" option[value='"+ivariables+"']").length==0) 
				$("select#"+variables).append("<option value=\"" + ivariables + "\">"+ivariables+"</option>");							
			$("select#"+variables).val(ivariables);						
		}	
		else if($("input#"+variables).length>0) 
		{
			$("input#"+variables).val(ivariables);
		}
		else
		{
			path=path+"&"+variables+"="+ivariables;
		}
		return path;
	}


	
	function page(sys_page,sys_row)
	{
	    $("#sys_page").val(sys_page);
	    $("#sys_row").val(sys_row);
	    
	    $("form").submit(); 
	}
	
	function command_device(comando,device_id)
	{
		var r = confirm(comando);
		if (r == true) 
		{
			if(comando=="Bloquear motor") 	comando="engineStop";
			if(comando=="Activar motor")	comando="engineResume";
						
			$.ajax({
				type: 'POST',
				url: 'http://solesgps.com:8082/api/commands',
				headers: {
					"Authorization": "Basic " + btoa("admin:EvG30")
				},
				contentType:"application/json",
				data:JSON.stringify({attributes:{},deviceId:device_id,type:comando}),
				success: function (response) 
				{
					console.log(response);
				}
			});

		} 				
	}	


