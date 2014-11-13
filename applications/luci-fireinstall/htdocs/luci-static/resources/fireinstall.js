
/*标记是否在管理APP的状态*/
var is_manage=false;

function load_application_list()
{
	//模板
	/*   
	<div class="fire-app-list" id="xxx">    
		         
		<div class="fire-app-logo"><img src="" /></div> 
		<div class="fire-app-delete-icon"><img src="/luci-static/resources/delete.png" /></div> 
		<div class="fire-app-title"></div>  
		<div class="fire-app-version"></div>
		<div class="fire-app-author"></div>
	</div>
	*/
	$.getJSON("/cgi-bin/luci/;stok="+$("#stok").val()+"/firefly-api/all_package",
		function(data){
			hide_loading_icon()
			if(data.error == 0)
			{
 				$.each(data.list, function(){   
					  //console.log(this);
					  var list='<div class="fire-app-list" id="'+this.plugin+'" src="'+this.src+'"><div class="fire-app-logo"><img src="'+this.plugin_Largeicon+'" /></div><div class="fire-app-delete-icon"><img src="/luci-static/resources/delete.png" /></div><div class="fire-app-title">'+this.plugin_Name+'</div><div class="fire-app-version">'+this.plugin_VersionName+'</div><div class="fire-app-author">'+this.plugin_Type+'</div></div>'
					  $("#fire-app-context").append(list)
					  bind_item_click_event()
				});
			}
			else if(data.error == 1)
			{
				//没有APP
				show_empty_icon()
			}
		}
	);
}

function hide_loading_icon()
{
	$("#fire-app-loading").fadeOut("fast")
}

function show_empty_icon()
{
	$("#fire_app_empty").show();
}

function bind_item_click_event(){
	$(".fire-app-list").unbind("click").click(function(){
		if(is_manage) {
			/*如果是管理状态，点击APP图标可以删除*/
			if(confirm($("#fire-delete-alert").html()))
			{
				var app = $(this)
				$.post("/cgi-bin/luci/;stok="+$("#stok").val()+"/firefly-api/delete_package", { "plugin":$(this).attr("id")},
					function(data){
					if(data.error == 0)
					{
						app.hide("slow");
						//如果没有APP了，显示当前没有APP
						if(parseInt(data.count) == 0)
							show_empty_icon()
					}
					else
						alert("删除失败");
				}, "json");
			}
		}
		else
		{
			/*不是管理状态，打开APP页面*/
			//cgi-bin/luci/admin/xcloud/comskip?page=
			var src=$(this).attr("src");
			if (src != "")
				window.location.href=src
		}
	});
}

$(document).ready(function(){

	
	/*管理APP按钮，点击进入管理状态*/
	$("#fire-manage").click(function(){
		//隐藏管理按钮
		$(this).hide();
		//显示完成按钮
		$("#fire-cancel-manage").show();
		//更改标记
		is_manage=true
		//更改样式
		$(".fire-app-delete-icon").show();
	});
	
	/*完成按钮*/
	$("#fire-cancel-manage").click(function(){
		/*隐藏完成按钮*/
		$(this).hide();
		/*显示管理按钮*/
		$("#fire-manage").show();
		//更改标记
		is_manage=false
		//更改样式
		$(".fire-app-delete-icon").hide();
	});
	
	/*刷新APP列表*/
	load_application_list()
	
	/*如果有错误信息的话，显示错误信息*/
	if($("#app_install_error").html())
	{
		alert($("#app_install_error").html())
	}
});
