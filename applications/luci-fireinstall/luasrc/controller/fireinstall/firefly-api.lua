module("luci.controller.fireinstall.firefly-api", package.seeall)

function index()
    local function authenticator(validator, accs)
        local auth = luci.http.formvalue("auth", true)
	local rv={} 
        if auth then 
            local sdat = luci.sauth.read(auth)
            if sdat then 
                 if sdat.user and luci.util.contains(accs, sdat.user) then
                       return sdat.user, auth
                 end
             end
         end
         --luci.http.status(403,"Forbidden")
         rv["error"]=403
         luci.http.prepare_content("application/json")
         luci.http.write_json(rv) 
    end

    local firefly_api = node("firefly-api")
    firefly_api.sysauth = "root"
    firefly_api.sysauth_authenticator = authenticator
    firefly_api.notemplate = true

    entry({"firefly-api", "all_package"}, call("read_install_package_list"))
    entry({"firefly-api", "delete_package"}, call("delete_package"))

end

function read_install_package_list()
        local uci = luci.model.uci.cursor()
	local fs  = require "luci.fs"
        local rv={}
        local list={}
        local i=0
	
        rv["error"]=1
        uci:foreach("fpkg", "globals",
                function(section)
			local index = ""
			--xcloud
			if section.plugin_Type == "xcloud" then
				if fs.isfile(section.plugin_IntallPath.."/html/index.htm") then
					index="/cgi-bin/luci/xcloud/comskip?page="..section.plugin_IntallPath.."/html/index.htm"
				end
			end
                        rv["error"]=0
                        list[section[".name"]]={
				plugin=section[".name"],
				src=index,
                                plugin_Name=section.plugin_Name,
                                plugin_VersionName=section.plugin_VersionName,
                                plugin_Largeicon=section.plugin_Largeicon,
                                plugin_Smallicon=section.plugin_Smallicon,
                                plugin_Type=section.plugin_Type,
                        }
                        i=i+1
                end
        )
        rv["list"]=list
        luci.http.prepare_content("application/json")
        luci.http.write_json(rv)
end

function delete_package()
	local plugin = luci.http.formvalue("plugin")
        local rv={}                                     
        local uci = luci.model.uci.cursor()                     
        local i=0                                                             
        rv["error"]=1                                                         
        rv["error"]=luci.sys.call("fpkg remove " .. plugin .. " >/dev/null")  
        uci:foreach("fpkg", "globals",                                        
                function(section)                                         
                        i=i+1                                             
                end                                             
        )                    
        rv["count"]=i                           
        luci.http.prepare_content("application/json")
        luci.http.write_json(rv) 
end





