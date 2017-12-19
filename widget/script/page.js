try {
    if (typeof baseApp === "undefined") {
        throw new Error("页面致命引用错误！缺少APP空间支持，无法正常使用！");
    }

    // 时间初始化对象
    baseApp.ns("page").InitDateTime = function (attrs) {
        $(attrs).mobiscroll().date({
            theme: 'android',
            mode: 'Scroller',
            display: 'top',
            lang: 'zh',
            demo: 'date'
        });
        var date = new Date();
        $(attrs).val(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
    }

    // 获取用户认证信息函数
    baseApp.ns("page").getAuthentication = function () {
        var names = baseApp.storage.local.get("uname");
        var pwds = baseApp.storage.local.get("upwd");
        if (names == null || names.length <= 0 || pwds == null || pwds.length <= 0) {
            localStorage.removeItem("uname");
            localStorage.removeItem("upwd");
            baseApp.page.removeSearchCache();
            window.location.href = baseApp.page.roundurl("main.html");
            return false;
        }
        return {
            name: names,
            pwd: pwds
        }
    }

    // 获取用户配置信息函数
    baseApp.ns("page").getUserSetting = function () {
        var addrs = baseApp.storage.local.get("userviceaddress"); // get local storage user setting service address
        var ports = baseApp.storage.local.get("userviceport"); // // get local storage user setting service port
        var provinces = baseApp.storage.local.get("uprovince"); // get local storage user settin province
        if (addrs == null || addrs.length <= 0 || ports == null || ports.length <= 0 || provinces == null || provinces.length <= 0) {
            alert("用户配置信息错误，请重新配置");
            //			localStorage.removeItem("userviceaddress");
            //			localStorage.removeItem("userviceport");
            //			localStorage.removeItem("uprovince");
            window.location.href = baseApp.page.roundurl("main.html?loadtype=setting");
            baseApp.page.removeSearchCache();
            return false;
        }
        return {
            addr: addrs,
            port: ports,
            province: provinces
        }
    }

    // 写入查询条件到缓存中
    baseApp.ns("page").setSearchCache = function (gQuestType, sBegTime, sEndTime, sCityName, sCountyName, sSiteName, nActualLane, nTotalAxle, nWeightTrue, nOverMinWeight, nOverMaxWeight, sPlateName) {
        baseApp.storage.session.set("gQuestType", gQuestType);
        baseApp.storage.session.set("sBegTime", sBegTime);
        baseApp.storage.session.set("sEndTime", sEndTime);
        baseApp.storage.session.set("sCityName", sCityName);
        baseApp.storage.session.set("sCountyName", sCountyName);
        baseApp.storage.session.set("sSiteName", sSiteName);
        baseApp.storage.session.set("nActualLane", nActualLane);
        baseApp.storage.session.set("nTotalAxle", nTotalAxle);
        baseApp.storage.session.set("nWeightTrue", nWeightTrue);
        baseApp.storage.session.set("nOverMinWeight", nOverMinWeight);
        baseApp.storage.session.set("nOverMaxWeight", nOverMaxWeight);
        baseApp.storage.session.set("sPlateName", sPlateName);
    }

    // 读取缓存查询条件
    baseApp.ns("page").getSearchCache = function () {
        return {
            gQuestType: baseApp.storage.session.get("gQuestType"),
            sBegTime: baseApp.storage.session.get("sBegTime"),
            sEndTime: baseApp.storage.session.get("sEndTime"),
            sCityName: baseApp.storage.session.get("sCityName"),
            sCountyName: baseApp.storage.session.get("sCountyName"),
            sSiteName: baseApp.storage.session.get("sSiteName"),
            nActualLane: baseApp.storage.session.get("nActualLane"),
            nTotalAxle: baseApp.storage.session.get("nTotalAxle"),
            nWeightTrue: baseApp.storage.session.get("nWeightTrue"),
            nOverMinWeight: baseApp.storage.session.get("nOverMinWeight"),
            nOverMaxWeight: baseApp.storage.session.get("nOverMaxWeight"),
            sPlateName: baseApp.storage.session.get("sPlateName")
        }
    }

    // 删除查询缓存条件
    baseApp.ns("page").removeSearchCache = function () {
        sessionStorage.removeItem("gQuestType");
        sessionStorage.removeItem("sBegTime");
        sessionStorage.removeItem("sEndTime");
        sessionStorage.removeItem("sCityName");
        sessionStorage.removeItem("sCountyName");
        sessionStorage.removeItem("sSiteName");
        sessionStorage.removeItem("nActualLane");
        sessionStorage.removeItem("nTotalAxle");
        sessionStorage.removeItem("nWeightTrue");
        sessionStorage.removeItem("nOverMinWeight");
        sessionStorage.removeItem("nOverMaxWeight");
        sessionStorage.removeItem("sPlateName");
    }

    // 数据请求
    baseApp.ns("page.request").ajax = function (type, getParameter, postParameter, callback) {

        // 检查用户是否登录
        if (!baseApp.page.getAuthentication()) {
            return;
        }

        // 请求服务器地址
        var sItem = baseApp.page.getUserSetting();
        if (!sItem) {
            return;
        }

        // 拼接服务器地址加端口
        var server = (((sItem.addr).indexOf('http') >= 0) ? sItem.addr : "http://" + sItem.addr) + ":" + sItem.port;

        // 最终请求地址
        var urls = server + "/HDW_DetectService" + ("/" + getParameter);
        $.ajax({
            type: (type != null && type == "post" ? "POST" : "get"),
            url: urls,
            data: postParameter,
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data == null) {
                    alert("操作失败");
                    return;
                }
                if (data.nResult == -1) {
                    alert("远程连接失败，请稍后重试");
                    return;
                } else if (data.nResult == -2) {
                    alert("操作失败，请重新登录");

                    localStorage.removeItem("uname");
                    localStorage.removeItem("upwd");
                    window.location.href = baseApp.page.roundurl("main.html");

                    return;
                }
                if (typeof (callback) === "function") {
                    callback(data);
                }
            }
        });
    }

    // 框架页面
    baseApp.ns("page.IndexPage").Init = function () {
        $(function () {
            var attr = {
                ck: "click",
                nav_event: 'div[data-event="nav"]',
                jcontent: '#J_container',
                jntt: '#J_navtoptit'
            }

            function loadHtml(obj) {
                var e = $(obj).find("a");
                var url = $(obj).data("url");
                var text = $(obj).text().trim();
                //if(!e.is(".action")) {
                //没有选中则进入
                $(attr.nav_event).find("a").removeClass("action");
                e.addClass("action");
                $(attr.jntt).text(text);
                $(attr.jcontent).load(url);
                //}
            }

            // 初始化加载数据
            if (baseApp.page.querystring("loadtype") == "setting") {
                loadHtml($(attr.nav_event + ':eq(1)'));
            } else {
                loadHtml($(attr.nav_event + ':eq(0)'));
            }

            // 导航菜单事件
            $(attr.nav_event).on(attr.ck, function () {
                loadHtml($(this));
            });
        });
    }

    // 登录页
    baseApp.ns("page.loginPage").Init = function () {
        baseApp.page.removeSearchCache();
        //	localStorage.removeItem("uname");
        //	localStorage.removeItem("upwd");

        $(function () {
            var attr = {
                ck: "click",
                name: "#J_exampleInputName",
                pwd: "#J_exampleInputPassword",
                btn: "#J_FromSubmit"
            }

            $(attr.btn).on(attr.ck, function () {
                var name = $(attr.name).val();
                var pwd = $(attr.pwd).val();
                if (name == "") {
                    alert("请输入用户名");
                    return;
                }

                if (pwd == "") {
                    alert("请输入密码");
                    return;
                }
                //获取配置中保存的用户名，密码
                var configName = baseApp.storage.local.get("uname");
                var configPwd = baseApp.storage.local.get("upwd");

                if (name == configName && pwd == configPwd) {
                    window.location.href = baseApp.page.roundurl("index.html");

                } else {
                    alert("用户名或密码错误");
                }
            });
        });
    }

    // 个人设置
    baseApp.ns("page.settingPage").Init = function () {

        $(function () {
            var attr = {
                ck: "click",
                name: "#J_exampleInputServerAdds",
                sip: "#J_exampleInputPort",
                prov: "#J_province",
                btn: "#J_FromSubmit",
                userName: "#J_UserName",
                oldPassword: "#J_OldPassword",
                newPassword: "#J_NewPassword"
            };

            // 请求服务器地址
            $(attr.name).val(baseApp.storage.local.get("userviceaddress"));
            $(attr.sip).val(baseApp.storage.local.get("userviceport"));
            $(attr.prov).val(baseApp.storage.local.get("uprovince"));

            // 设置初始默认密码
            var uname = baseApp.storage.local.get("uname");
            var upwd = baseApp.storage.local.get("upwd");
            if (uname == null || upwd == null || uname == "" || upwd == "") {
                baseApp.storage.local.set("uname", "admin"); // 存入新的用户名
                baseApp.storage.local.set("upwd", "1234567"); // 存入新的密码
            }

            //默认带出用户名
            $(attr.userName).val(baseApp.storage.local.get("uname"));

            $(attr.btn).on(attr.ck, function () {
                var name = $(attr.name).val();
                var sip = $(attr.sip).val();
                var prov = $(attr.prov).val();
                var username = $(attr.userName).val(); //用户名
                var oldPassword = $(attr.oldPassword).val(); //旧密码
                var newPassword = $(attr.newPassword).val(); //新密码
                var oldlocalPassword = baseApp.storage.local.get("upwd"); // 缓存旧密码

                if (name == "") {
                    alert("请输入服务器地址");
                    return;
                }

                if (sip == "") {
                    alert("请输入IP及端口");
                    return;
                }

                if (prov == null || prov == "") {
                    alert("请选择省份");
                    return;
                }
                if (username == "") {
                    alert("请输入用户名");
                    return;
                }

                if (oldPassword != "" && oldlocalPassword != "") {
                    if (oldPassword != oldlocalPassword) {
                        alert("旧密码输入错误，请重新输入");
                        return;
                    }
                    if (oldPassword == newPassword) {
                        alert("新密码不能与旧密码相等，请重新输入");
                        return;
                    }

                    if (newPassword.length < 6) {
                        alert("新密码长度必须大于等于6位数，请重新输入");
                        return;
                    }

                    baseApp.storage.local.set("uname", username); // 存入新的用户名
                    baseApp.storage.local.set("upwd", newPassword); // 存入新的密码
                }

                baseApp.storage.local.set("userviceaddress", name); // 服务器地址
                baseApp.storage.local.set("userviceport", sip); // 服务器端口
                baseApp.storage.local.set("uprovince", prov); // 省

                alert("设置成功");
            });
        });
    }

    // 车牌查询
    baseApp.ns("page.numberPlatesPage").Init = function () {

        // 检查用户是否登录
        var users = baseApp.page.getAuthentication();

        var attr = {
            ck: "click",
            cg: "change",
            st: "#J_StartTime", // 起始时间
            et: "#J_EndTime", // 结束时间
            j_sfjc: "#J_sfjc", // 省份检查
            j_cszf: "#J_cszf", // 城市字符
            j_cph: "#J_cph", //车牌好
            btnQuery: "#J_btnQuery", //查询按钮
            jcontent: '#J_container'
        }

        baseApp.page.InitDateTime(attr.st);
        baseApp.page.InitDateTime(attr.et);

        //默认选中配置中选择的省
        var Provice = baseApp.storage.local.get("uprovince");
        if (Provice != null && Provice != "") {
            var str = "";
            switch (Provice) {
                case "安徽": str = "皖"; break;
                case "北京": str = "京"; break;
                case "重庆": str = "渝"; break;
                case "福建": str = "闽"; break;
                case "甘肃": str = "甘"; break;
                case "广东": str = "粤"; break;
                case "广西壮族": str = "桂"; break;
                case "贵州": str = "贵"; break;
                case "海南": str = "琼"; break;
                case "河北": str = "冀"; break;
                case "河南": str = "豫"; break;
                case "黑龙江": str = "黑"; break;
                case "湖北": str = "鄂"; break;
                case "湖南": str = "湘"; break;
                case "吉林": str = "吉"; break;
                case "江苏": str = "苏"; break;
                case "江西": str = "赣"; break;
                case "辽宁": str = "辽"; break;
                case "内蒙古": str = "蒙"; break;
                case "宁夏回族": str = "宁"; break;
                case "青海": str = "青"; break;
                case "山东": str = "鲁"; break;
                case "山西": str = "晋"; break;
                case "陕西": str = "陕"; break;
                case "上海": str = "沪"; break;
                case "四川": str = "川"; break;
                case "天津": str = "津"; break;
                case "西藏": str = "藏"; break;
                case "新疆维吾尔": str = "新"; break;
                case "云南": str = "云"; break;
                case "浙江": str = "浙"; break;
            }
            $(attr.j_sfjc).val(str);
        }


        // 按钮查询事件
        $(attr.btnQuery).on(attr.ck, function () {
            var str = baseApp.page;
            var st = str.trim($(attr.st).val());
            var nt = str.trim($(attr.et).val());
            var j_sfjc = str.trim($(attr.j_sfjc).val());
            var j_cszf = str.trim($(attr.j_cszf).val());
            var j_cph = str.trim($(attr.j_cph).val());
            if (st == null || st == "" || st.length <= 0) {
                alert("请选择开始时间");
                return false;
            }

            if (nt == null || nt == "" || nt.length <= 0) {
                alert("请选择结束时间");
                return false;
            }

			/*if(j_cph == null || j_cph == "" || j_cph.length <= 0) {
				alert("请输入车牌号");
				return false;
			}*/
            baseApp.page.setSearchCache(2, st + ' 00:00:00.000', nt + ' 23:59:59.999', '', '', '', '', 0, 0, 0, 500000, (j_sfjc + j_cszf + j_cph));

            // 加载也没
            $(attr.jcontent).load('Table.html');

        });

    }

    // 预检查询
    baseApp.ns("page.previewPage").Init = function () {

        var attr = {
            ck: "click",
            cg: "change",
            st: "#J_StartTime", // 起始时间
            et: "#J_EndTime", // 结束时间
            jy: "#J_YJCD", // 预检车道
            jc: "#J_clzx", // 车辆抽型
            jcz: "#J_czbs", // 超重标识
            city: "#J_city", // 省地级市名称   999-忽略
            county: "#J_county", // 县级市县名称 999-忽略
            site: "#J_SiteRegister", // 检测地点
            btnQuery: "#J_btnQuery", //查询按钮
            tbmTemp: "#J_TableTemplate", // 表格模板ID
            jcontent: '#J_container' //内容ID
        }

        // 检查用户是否登录
        var users = baseApp.page.getAuthentication();

        // 获取服务数据验证数据
        var serverusers = baseApp.page.authenticationServerInfo();

        // 获取省份
        var provinces = baseApp.storage.local.get("uprovince");

        // 时间空间 初始化
        baseApp.page.InitDateTime(attr.st);
        baseApp.page.InitDateTime(attr.et);

        var fun = {
            Init: function () {

                // 初始化市县级联
                baseApp.page.BaseInit.getCityAndCountyHtml(null, function (cityHtml, countyHtml) {
                    $(attr.city).find("option").remove();
                    $(attr.county).find("option").remove();
                    $(attr.city).append(cityHtml);
                    $(attr.county).append(countyHtml);

                    monitoringSite();
                    $(attr.city).on(attr.cg, function () {
                        var city = $(this).val();
                        baseApp.page.BaseInit.getCityAndCountyHtml(city, function (cityHtml, countyHtml) {
                            $(attr.county).find("option").remove();
                            $(attr.county).append(countyHtml);
                            monitoringSite();
                        });
                    });
                    $(attr.county).on(attr.cg, function () {
                        monitoringSite();
                    });

                    // 检测地点
                    function monitoringSite() {
                        var city = $(attr.city).val();
                        var county = $(attr.county).val();
                        baseApp.page.BaseInit.getMonitoringSite(serverusers.name, serverusers.pwd, provinces, city, county, function (sitehtml) {
                            $(attr.site).find("option").remove();
                            $(attr.site).append(sitehtml);
                        });
                    }
                });

                // 按钮查询事件
                $(attr.btnQuery).on(attr.ck, function () {
                    var str = baseApp.page;
                    var st = str.trim($(attr.st).val());
                    var nt = str.trim($(attr.et).val());
                    var jy = str.trim($(attr.jy).val());
                    var jc = str.trim($(attr.jc).val());
                    var jcz = str.trim($(attr.jcz).val());
                    var city = str.trim($(attr.city).val());
                    if (city == "999") {
                        city = "";
                    }
                    var county = str.trim($(attr.county).val());
                    if (county == "999") {
                        county = "";
                    }
                    var site = str.trim($(attr.site).val());

                    if (st == null || st == "" || st.length <= 0) {
                        alert("请选择开始时间");
                        return false;
                    }

                    if (nt == null || nt == "" || nt.length <= 0) {
                        alert("请选择结束时间");
                        return false;
                    }

                    baseApp.page.setSearchCache(0, st + ' 00:00:00.000', nt + ' 23:59:59.999', city, county, site, jy, jc, jcz, 0, 500000, '');

                    // 加载也没
                    $(attr.jcontent).load('Table.html');

                });
            }
        }

        fun.Init();

    }

    // 超限查询
    baseApp.ns("page.overrunPage").Init = function () {

        var attr = {
            ck: "click",
            cg: "change",
            st: "#J_StartTime", // 起始时间
            et: "#J_EndTime", // 结束时间
            jy: "#J_YJCD", // 预检车道
            jminczmk: "#J_minczmk", // min超重门槛
            jmaxczmk: "#J_maxczmk", // min超重门槛
            city: "#J_city", // 省地级市名称   999-忽略
            county: "#J_county", // 县级市县名称 999-忽略
            site: "#J_SiteRegister", // 检测地点
            btnQuery: "#J_btnQuery", //查询按钮
            jcontent: '#J_container' //内容ID
        }

        // 检查用户是否登录
        var users = baseApp.page.getAuthentication();

        // 获取服务数据验证数据
        var serverusers = baseApp.page.authenticationServerInfo();

        // 获取省份
        var provinces = baseApp.storage.local.get("uprovince");

        baseApp.page.InitDateTime(attr.st);
        baseApp.page.InitDateTime(attr.et);

        var fun = {
            Init: function () {

                // 初始化市县级联
                baseApp.page.BaseInit.getCityAndCountyHtml(null, function (cityHtml, countyHtml) {
                    $(attr.city).find("option").remove();
                    $(attr.county).find("option").remove();
                    $(attr.city).append(cityHtml);
                    $(attr.county).append(countyHtml);
                    monitoringSite();
                    $(attr.city).on(attr.cg, function () {
                        var city = $(this).val();
                        baseApp.page.BaseInit.getCityAndCountyHtml(city, function (cityHtml, countyHtml) {
                            $(attr.county).find("option").remove();
                            $(attr.county).append(countyHtml);
                            monitoringSite();
                        });
                    });
                    $(attr.county).on(attr.cg, function () {
                        monitoringSite();
                    });

                    // 检测地点
                    function monitoringSite() {
                        var city = $(attr.city).val();
                        var county = $(attr.county).val();
                        baseApp.page.BaseInit.getMonitoringSite(serverusers.name, serverusers.pwd, provinces, city, county, function (sitehtml) {
                            $(attr.site).find("option").remove();
                            $(attr.site).append(sitehtml);
                        });
                    }
                });

                // 按钮查询事件
                $(attr.btnQuery).on(attr.ck, function () {
                    var str = baseApp.page;
                    var st = str.trim($(attr.st).val());
                    var nt = str.trim($(attr.et).val());
                    var jy = str.trim($(attr.jy).val());

                    var jminczmk = Number(str.trim($(attr.jminczmk).val()));
                    var jmaxczmk = Number(str.trim($(attr.jmaxczmk).val()));

                    var city = str.trim($(attr.city).val());
                    if (city == "999") {
                        city = "";
                    }
                    var county = str.trim($(attr.county).val());
                    if (county == "999") {
                        county = "";
                    }
                    var site = str.trim($(attr.site).val());

                    if (st == null || st == "" || st.length <= 0) {
                        alert("请选择开始时间");
                        return false;
                    }

                    if (nt == null || nt == "" || nt.length <= 0) {
                        alert("请选择结束时间");
                        return false;
                    }

                    baseApp.page.setSearchCache(1, st + ' 00:00:00.000', nt + ' 23:59:59.999', city, county, site, jy, 0, 1, jminczmk, jmaxczmk, '');

                    // 加载也没
                    $(attr.jcontent).load('Table.html');

                });
            }
        }

        fun.Init();
    }

    // 个人中心
    baseApp.ns("page.personalcenterPage").Init = function () {

        //alert("个人中心 被调用");
        var attr = {
            ck: "click",
            btn_exit: "#J_btnexit",
            btn_prev: "#J_btnPrev", // 上一页
            btn_next: "#J_btnNext", // 下一页
            tit_cpage: "#J_currentpage", // 当前页
            tit_pcount: "#J_pagecount" //总页数
        }
        $(attr.btn_exit).on(attr.ck, function () {
            window.location.href = baseApp.page.roundurl("login.html");
        });

    }

    // 表格数据
    baseApp.ns("page.tablePage").Init = function () {
        var attr = {
            ck: "click",
            jml: "#J_maskLayer",
            jmw: "#J_maskWin",
            jcontent: '#J_container', // 主题内容
            jtt: "#J_tableTbody", // 表格Tbody ID
            jfy: "#J_fenye", //分页区域
            btn_prev: "#J_btnPrev", // 上一页
            btn_next: "#J_btnNext", // 下一页
            tit_cpage: "#J_currentpage", // 当前页
            tit_pcount: "#J_pagecount" //总页数
        }
        var fun = {
            getQueryTable: function (iPageIndex) {

                var nPageIndex = iPageIndex || 1;
                var nPageSize = 25;
                var params = baseApp.page.getSearchCache();

                // 将页数写入缓存
                baseApp.storage.session.set("nPageIndex", nPageIndex);

                baseApp.page.BaseInit.getPageQueryTable(params.gQuestType, Number(nPageSize), Number(nPageIndex), params.sBegTime, params.sEndTime, params.sCityName, params.sCountyName, params.sSiteName, Number(params.nActualLane), Number(params.nTotalAxle), Number(params.nWeightTrue), Number(params.nOverMinWeight), Number(params.nOverMaxWeight), params.sPlateName, function (data) {
                    var html = '';
                    if (data.zVehicleDataList.length > 0) {
                        for (var i = 0; i < data.zVehicleDataList.length; i++) {
                            var jsons = data.zVehicleDataList[i];
                            if (jsons.nWeightTrue == 1) {
                                html += '<tr class="overrun" data-event="ck" data-code="' + jsons.sDetectCode + '" >';
                            } else {
                                html += '<tr data-event="ck" data-code="' + jsons.sDetectCode + '" >';
                            }

                            html += '<td>' + jsons.sDateTime + '</td>';
                            html += '<td>' + jsons.sPlateName + '</td>';
                            html += '<td>' + (jsons.nTotalWeight / 1000).toFixed(1) + '</td>';
                            html += '<td>' + jsons.sSiteName + '</td>';
                            html += '</tr>';
                        }
                    } else {
                        html = '<tr><td colspan="4">无数据</td></tr>'
                    }
                    $(attr.jtt + " tr").remove();
                    $(attr.jtt).append(html);

                    var pageCount = 1;
                    if (data.nDataCount > nPageSize) {
                        pageCount = Math.floor(data.nDataCount / nPageSize) + 1;
                    }
                    $(attr.btn_next).removeAttr("data-maxpage").attr("data-maxpage", pageCount);
                    $(attr.tit_pcount).text(pageCount);

                    //  如果是从子页面返回的那么这里就会读取到值，读取到值后设定对应的样式
                    var refData = baseApp.storage.session.get("refData");
                    if (refData != null && refData != "") {
                        sessionStorage.removeItem("refData");
                        var refCode = baseApp.storage.session.get("detailCode");
                        $("tr[data-code='" + refCode + "']").addClass("actionoverrun");
                    }

                    $('tr[data-event="ck"]').on(attr.ck, function () {
                        var code = $(this).data("code");
                        if (code == null || code == "" || code.length < 1) {
                            alert("无详情数据");
                            return false;
                        }
                        baseApp.storage.session.set("detailCode", code);
                        // 加载页面
                        $(attr.jcontent).load('Detail.html');

                    });

                });
            },
            fenye: function () {
                // 上一页
                $(attr.btn_prev).on(attr.ck, function () {
                    var min = Number($(this).attr("data-minpage"));
                    var thisPage = Number($(this).attr("data-page"));
                    if (thisPage <= min) {
                        alert("已经是第一页了");
                        return false;
                    }
                    thisPage = Number(thisPage) - 1;
                    fun.getQueryTable(thisPage);
                    $(attr.tit_cpage).text(thisPage);
                    $(this).removeAttr("data-page").attr("data-page", thisPage);
                    $(attr.btn_next).removeAttr("data-page").attr("data-page", thisPage);
                });

                // 下一页
                $(attr.btn_next).on(attr.ck, function () {
                    var max = Number($(this).attr("data-maxpage"));
                    var thisPage = Number($(this).attr("data-page"));
                    if (thisPage >= max) {
                        alert("已经是最后一页了");
                        return false;
                    }
                    thisPage = Number(thisPage) + 1;
                    fun.getQueryTable(thisPage);
                    $(attr.tit_cpage).text(thisPage);
                    $(attr.btn_prev).removeAttr("data-page").attr("data-page", thisPage);
                    $(this).removeAttr("data-page").attr("data-page", thisPage);
                });
            }
        }
        // 有缓存使用缓存
        fun.getQueryTable( baseApp.storage.session.get("nPageIndex") || 1);
        fun.fenye();
    }

    // 数据详情
    baseApp.ns("page.DetailInfoPage").Init = function () {

        var attr = {
            ck: "click",
            btnGoBack: "#btnGoBack",
            layerWin: "#J_layerWin",
            txtOrderNo: "#txtOrderNo",
            txtDateTime: "#txtDateTime",
            htmlWin: "#J_maskWin",
            txtZX: "#txtZX", // 轴型
            txtCarPlace: "#txtCarPlace", // 车牌归属地
            txtCarNo: "#txtCarNo", // 车牌
            txtCHZL: "#txtCHZL", // 车货重量
            txtCXBZ: "#txtCXBZ", // 超限标志
            txtXZ: "#txtXZ", // 限重
            txtCX: "#txtCX", // 超限
            txtCXBL: "#txtCXBL", // 超限比例
            txtCHKD: "#txtCHKD", //车货宽度
            txtCKBL: "#txtCKBL", //超宽标志
            txtXK: "#txtXK", //限宽
            txtCK: "#txtCK", // 超宽
            txtXG: "#txtXG", // 超高
            txtCHBL: "#txtCHBL", // 超宽比例
            txtCHGD: "#txtCHGD", // 车货高度
            txtCGBZ: "#txtCGBZ", // 超高标志
            txtCG: "#txtCG", // 超高
            txtCGBL: "#txtCGBL", // 超高比例
            txtCHCD: "#txtCHCD", // 车货长度
            txtCCBZ: "#txtCCBZ", // 超长标志
            txtXC: "#txtXC", //限长
            txtCC: "#txtCC", //超长
            txtCCBL: "#txtCCBL", //超长比例
            txtJCCS: "#txtJCCS", //检测车速
            txtJCCD: "#txtJCCD", //检测车道
            txtJCTD: "#txtJCTD", //检测通道
            txtZDLX: "#txtZDLX", //站点类型
            txtZDMC: "#txtZDMC", //站点名称
            txtCQTP: "#txtCQTP", //车前图片
            txtCHTP: "#txtCHTP", //车后图片
        }

        // 检查用户是否登录
        var users = baseApp.page.getAuthentication();

        // 获取服务数据验证数据
        var serverusers = baseApp.page.authenticationServerInfo();

        //此处是传过来的Code
        var detectCode = baseApp.storage.session.get("detailCode");
        // 检测地点
        baseApp.page.request.ajax(
            "get",
            "QuestVehicleDataV6/" + serverusers.name + "/" + serverusers.pwd + "/" + detectCode,
            null,
            function (data) {
                try {
                    $(attr.txtOrderNo).text(data.zVehicleData.sDetectCode); //单号
                    $(attr.txtDateTime).text(data.zVehicleData.sDateTime); //时间
                    $(attr.txtZX).text(data.zVehicleData.nTotalAxle); //轴型
                    $(attr.txtCarNo).text(data.zVehicleData.sPlateName); //车牌号
                    $(attr.txtCHZL).text((data.zVehicleData.nTotalWeight / 1000).toFixed(1)); //车货重量
                    $(attr.txtCXBZ).text(data.zVehicleData.nWeightTrue == 0 ? "正常" : "超限"); //超限标志
                    $(attr.txtXZ).text((data.zVehicleData.nLimitWeight / 1000).toFixed(1)); //限重
                    $(attr.txtCX).text((data.zVehicleData.nOverWeight / 1000).toFixed(1)); //超限
                    $(attr.txtCXBL).text(data.zVehicleData.nRatiorWeight); //超限比例
                    $(attr.txtCHKD).text((data.zVehicleData.nTotalWidth / 1000).toFixed(2)); //车货宽度
                    $(attr.txtXK).text((data.zVehicleData.nLimitWidth / 1000).toFixed(2)); //限宽
                    $(attr.txtCK).text((data.zVehicleData.nOverWidth / 1000).toFixed(2)); //超宽宽度
                    $(attr.txtXG).text((data.zVehicleData.nLimitHeight / 1000).toFixed(2)); //限高
                    $(attr.txtCKBL).text(data.zVehicleData.nWidthTrue == "0" ? "正常" : "超宽"); //超宽标志
                    $(attr.txtCHBL).text(data.zVehicleData.nRatiorWidth); //车货比例 ,超宽比例
                    $(attr.txtCHGD).text((data.zVehicleData.nTotalHeight / 1000).toFixed(2)); //车货高度
                    $(attr.txtCGBZ).text(data.zVehicleData.nHeightTrue == "0" ? "正常" : "超高"); //超高标志
                    $(attr.txtCG).text((data.zVehicleData.nOverHeight / 1000).toFixed(2)); //超高
                    $(attr.txtCGBL).text(data.zVehicleData.nRatiorHeight); //超高比例
                    $(attr.txtCHCD).text((data.zVehicleData.nTotalLength / 1000).toFixed(2)); //车货长度
                    $(attr.txtCCBZ).text(data.zVehicleData.nLengthTrue == "0" ? "正常" : "超长"); //超长标志
                    $(attr.txtXC).text((data.zVehicleData.nLimitLength / 1000).toFixed(2)); //限长
                    $(attr.txtCC).text(data.zVehicleData.nOverLength); //超长
                    $(attr.txtCCBL).text(data.zVehicleData.nRatiorLength); //超长比例
                    $(attr.txtJCCS).text(data.zVehicleData.nTotalSpeed); //检测车速
                    $(attr.txtJCCD).text(data.zVehicleData.nDetectLane); //检测车道
                    $(attr.txtJCTD).text(data.zVehicleData.nEnterChannel == "0" ? "上行" : "下行"); //检测通道

                    var typeid = data.zVehicleData.nSiteType;
                    var TypeName = "";
                    if (typeid == "1") {
                        TypeName = "源头企业点";
                    } else if (typeid == "2") {
                        TypeName = "固定治超站";
                    } else if (typeid == "3") {
                        TypeName = "道路治超点";
                    } else if (typeid == "4") {
                        TypeName = "流动执法车";
                    } else if (typeid == "5") {
                        TypeName = "高速收费站";
                    } else if (typeid == "6") {
                        TypeName = "视频监控点";
                    } else if (typeid == "255") {
                        TypeName = "无效";
                    }

                    $(attr.txtZDLX).text(TypeName); //站点类型 1-源头企业点 2-固定治超站 3-道路治超点 4-流动执法车 5-高速收费站 6-视频监控点 255-无效
                    $(attr.txtZDMC).text(data.zVehicleData.sSiteName); //站点名称
                    $(attr.txtCQTP).attr("data-url", data.zVehicleData.sHeadImage); //车前图片
                    $(attr.txtCHTP).attr("data-url", data.zVehicleData.sTrailImage); //车后图片

                } catch (e) {
                    alert("数据绑定异常");
                }
            }

        );

        // 展示图片事件
        $(attr.txtCQTP + "," + attr.txtCHTP).on(attr.ck, function () {
            var url = $(this).data("url");
            url = url.replace(/:\\/g, "$^");
            url = url.replace(/(\\)/g, "^");
            if (url == null || url == "" || url.length <= 0) {
                return false;
            }
            // 请求服务器地址
            var sItem = baseApp.page.getUserSetting();
            if (!sItem) {
                return;
            }

            // 拼接服务器地址加端口
            var server = (((sItem.addr).indexOf('http') >= 0) ? sItem.addr : "http://" + sItem.addr) + ":" + sItem.port;

            // 最终请求地址
            var urls = server + "/YIV_DetectService/DownloadFileV2/" + serverusers.name + "/" + serverusers.pwd + "/" + url;

            $(attr.layerWin).removeClass("hidden");
            $(attr.htmlWin).find("img").remove();
            $(attr.htmlWin).append($("<img>").attr("src", urls));
        });

        // 关闭事件
        $(attr.layerWin + "," + attr.jml + "," + attr.jmw).on(attr.ck, function () {
            $(attr.layerWin).addClass("hidden");
        });

        //返回上一步
        $(attr.btnGoBack).on(attr.ck, function () {
            $("#J_container").load('Table.html');
            baseApp.storage.session.set("refData", "yes");
        });

    }

    // 页面初始化完成后执行公共请求数据
    baseApp.ns("page.BaseInit").getCityAndCounty = function (Callback) {

        var cityJson = baseApp.storage.session.get("cityAndCounty"); // 获取信息

        if (cityJson == "undefined" || cityJson == null || cityJson.length <= 0) {

            // 检查用户是否登录
            var users = baseApp.page.getAuthentication();

            // 获取服务数据验证数据
            var serverusers = baseApp.page.authenticationServerInfo();

            // 获取省份
            var provinces = baseApp.storage.local.get("uprovince");

            // js 完成 初始化请求数据
            baseApp.page.request.ajax("get", "QuestCityRegionV3/" + serverusers.name + "/" + serverusers.pwd + "/" + provinces,
                null,
                function (data) {
                    if (data.nResult == 0) {
                        alert("获取监测站点失败");
                    } else if (data.nResult >= 0) {
                        var city = "";
                        var county = "";

                        for (var i = 0; i < data.zCityRegionList.length; i++) {
                            var list = data.zCityRegionList[i];
                            var cityNames = list.sCityName;
                            var countyCodeAndNames = cityNames + ':' + list.sCityCode + ':' + list.sCountyName;
                            if (!(city.indexOf(cityNames) >= 0)) {
                                if (city.length > 0) {
                                    city = city + "," + cityNames;
                                } else {
                                    city = city + cityNames;
                                }
                            }
                            if (!(county.indexOf(countyCodeAndNames) >= 0)) {
                                if (county.length > 0) {
                                    county = county + "," + countyCodeAndNames;
                                } else {
                                    county = county + countyCodeAndNames;
                                }
                            }
                        }

                        var citys = city.split(',');
                        var countys = county.split(',');
                        var cityAndCountyJson = {
                            data: []
                        };
                        if (citys != null) {
                            for (var i = 0; i < citys.length; i++) {
                                var jsons = {
                                    cityName: citys[i],
                                    county: []
                                }

                                for (var j = 0; j < countys.length; j++) {
                                    var splits = countys[j].split(":");
                                    if (splits[0] == citys[i] && splits[0].length == 3) {
                                        jsons.county.push({
                                            code: splits[1],
                                            name: splits[2]
                                        });
                                    }
                                }
                                cityAndCountyJson.data.push(jsons);
                            }
                        }
                        // 存入缓存
                        baseApp.storage.session.set("cityAndCounty", JSON.stringify(cityAndCountyJson));

                        Callback();
                    }
                }
            );
        } else {
            Callback();
        }
    }

    // 市县级联数据解析
    baseApp.ns("page.BaseInit").getCityAndCountyHtml = function (strCityName, Callback) {
        baseApp.page.BaseInit.getCityAndCounty(
            function () {
                var city = baseApp.storage.session.get("cityAndCounty"); // 获取信息
                var cityAndCountyJson = JSON.parse(city);
                var refCityHtml = '<option value="999">忽略</option>';
                var refCountyHtml = '<option value="999">忽略</option>';
                if (cityAndCountyJson.data != null && cityAndCountyJson.data.length > 0) {
                    for (var i = 0; i < cityAndCountyJson.data.length; i++) {
                        var cityName = cityAndCountyJson.data[i].cityName;

                        refCityHtml = refCityHtml + '<option value="' + cityName + '">' + cityName + '</option>';
                        var countyHtml = null;
                        if (strCityName != "undefined" && strCityName != null && strCityName.length > 0 && strCityName != "999") {
                            countyHtml = cityAndCountyJson.data[i].county;
                            if (strCityName == cityName && countyHtml != null) {
                                for (var j = 0; j < countyHtml.length; j++) {
                                    refCountyHtml = refCountyHtml + '<option value="' + countyHtml[j].name + '">' + countyHtml[j].name + '</option>';
                                }
                            }
                        } else {
                            countyHtml = cityAndCountyJson.data[i].county;
                            if (countyHtml != null) {
                                for (var j = 0; j < countyHtml.length; j++) {
                                    refCountyHtml = refCountyHtml + '<option value="' + countyHtml[j].name + '">' + countyHtml[j].name + '</option>';
                                }
                            }
                        }
                    }
                }
                Callback(refCityHtml, refCountyHtml);
            }
        );
    }

    // 获取监控地点
    baseApp.ns("page.BaseInit").getMonitoringSite = function (usersName, usersPwd, provinces, strCityName, strCountyName, Callback) {
        baseApp.page.request.ajax(
            "get",
            "QuestSiteRegisterV3/" + usersName + "/" + usersPwd + "/" + provinces + "/" + strCityName + "/" + strCountyName,
            null,
            function (data) {
                var html = '<option value="">忽略</option>';
                if (data.nResult > 0) {
                    for (var i = 0; i < data.zSiteRegisterList.length; i++) {
                        html = html + '<option value="' + data.zSiteRegisterList[i].sSiteName + '">' + data.zSiteRegisterList[i].sSiteName + '</option>'
                    }
                }
                Callback(html);
            }
        );
    }

    ///<summary> 查询车辆数据</summary>
    ///<param name="gQuestType"> 查询类型 0-按时间范围 1-按超限范围 2-按车牌号码 </param>
    ///<param name="nPageIndex"> 页码( 第几页 ) </param>
    ///<param name="sBegTime"> 起始时间 </param>
    ///<param name="sEndTime"> 结束时间 </param>
    ///<param name="sProvinceName">省份名称 空-忽略</param> /////////////////////////////////////
    ///<param name="sCityName">城市名称 空-忽略</param>
    ///<param name="sCountyName">县区名称 空-忽略</param>
    ///<param name="sSiteName">站点名称 空-忽略</param>
    ///<param name="nActualLane">实际车道 0-忽略 1-车道1 2-车道2 3-车道3 4-车道4 以此类推</param>
    ///<param name="nTotalAxle">车辆轴型 0-忽略 2-2轴 3-3轴 4-4轴 5-5轴 6-6轴</param>
    ///<param name="nWeightTrue">超限标志 0-正常 1-超限 2-忽略</param>
    ///<param name="nOverMinWeight">起始超限门槛 单位: 公斤</param>
    ///<param name="nOverMaxWeight">最大超限门槛 单位: 公斤</param>
    ///<param name="sPlateName">车牌号码 空-忽略</param>
    ///<returns>查询成功(总数) </returns>
    baseApp.ns("page.BaseInit").getPageQueryTable = function (gQuestType, nPageSize, nPageIndex, sBegTime, sEndTime, sCityName, sCountyName, sSiteName, nActualLane, nTotalAxle, nWeightTrue, nOverMinWeight, nOverMaxWeight, sPlateName, Callback) {

        // 检查用户是否登录
        var users = baseApp.page.getAuthentication();

        // 获取服务数据验证数据
        var serverusers = baseApp.page.authenticationServerInfo();

        // 获取省份
        var provinces = baseApp.storage.local.get("uprovince");
        var ttt = {
                "nPageSize": nPageSize,
                "nPageIndex": nPageIndex,
                "sBegTime": sBegTime,
                "sEndTime": sEndTime,
                "sProvince": provinces,
                "sCityName": sCityName,
                "sCountyName": sCountyName,
                "nSiteType": gQuestType,
                "sSiteName": sSiteName,
                "nActualLane": nActualLane,
                "nEnterChannel": 0,
                "nTotalAxle": nTotalAxle,
                "nWeightTrue": nWeightTrue,
                "nMinOverWeight": nOverMinWeight,
                "nMaxOverWeight": nOverMaxWeight,
                "nMinRatiorWeight": nOverMinWeight,
                "nMaxRatiorWeight": nOverMaxWeight,
                "sPlateName": sPlateName,
                "nCtrlState": 0
            };
        // for(var a in ttt){
        //     alert(a+': '+ttt[a]);
        // }
        baseApp.page.request.ajax(
            "post",
            "QuestVehicleDataV5/" + serverusers.name + "/" + serverusers.pwd, JSON.stringify({
                "nPageSize": nPageSize,
                "nPageIndex": nPageIndex,
                "sBegTime": sBegTime,
                "sEndTime": sEndTime,
                "sProvince": provinces,
                "sCityName": sCityName,
                "sCountyName": sCountyName,
                "nSiteType":gQuestType,
                "sSiteName": sSiteName,
                "nActualLane": nActualLane,
                "nEnterChannel": 0,
                "nTotalAxle": nTotalAxle,
                "nWeightTrue": nWeightTrue,
                "nMinOverWeight": nOverMinWeight,
                "nMaxOverWeight": nOverMaxWeight,
                "nMinRatiorWeight": nOverMinWeight,
                "nMaxRatiorWeight": nOverMaxWeight,
                "sPlateName": sPlateName,
                "nCtrlState": 0
            }),
            function (data) {
                Callback(data);
            }
        );
    }

} catch (e) {
    alert(e);
}
