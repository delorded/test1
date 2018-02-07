/**
 *  扩展js 字符串格式化方法
 var result1="i am {0}，{1}years old".format("test",22);
 var result2="my name is {name}，{age} years old".format({name:"test",age:22});
 * @param args
 * @returns {String}
 */
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};
dtgl = {
    query_types: ["ip", "domain", "hash", "email"],
    urls: {
        online:"/api/v1/{0}/allo?{1}={2}",
        offline:"",
        download:{
            ip:"",
            domain:"",
            email:"",
            hash:"",
            person:""
        }
    },
    request: function (paras) {
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {}
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        var returnValue = paraObj[paras.toLowerCase()];
        if (typeof(returnValue) == "undefined") {
            return "";
        } else {
            return returnValue;
        }
    },
    /**
     * 去掉空格
     * @param str
     * @param is_all  是否去掉全局空格，否则去掉首位空格
     * @returns {*}
     * @constructor
     */
    trim: function (str, is_all) {
        var result;
        sult = str.replace(/(^\s+)|(\s+$)/g, "");
        if (is_all) {
            result = str.replace(/\s/g, "");
        }
        return result;
    },
    isIp: function (ip) {
        var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;//正则表达式
        if (re.test(ip)) {
            if (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256)
                return true;
        }
        return false;
    },
    isDomain: function (str) {
        var RegUrl = new RegExp();
        RegUrl.compile("^([a-zA-Z\\d][a-zA-Z\\d-_]+\\.)+[a-zA-Z\\d-_][^ ]*$");
        return RegUrl.test(str)
    },
    isEmail: function (str) {
        return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str);
    },

    isHash: function (str) {
        var lenstr = 0;
        lenstr = str.length;
        if (lenstr == 32 || lenstr == 40 || lenstr == 64) {
            return true;
        }
        else return false;
    },

    /**
     * StringFormat("&Type={0}&Ro={1}&lPlan={2}&Plan={3}&={4}&Id={5}&Id={6}", data1, data2, data3,data4, data5,data6,data7);
     * @returns {*}
     */
    stringFormat: function () {
        if (arguments.length == 0)
            return null;
        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }
        return str;
    },

    /**
     * 可恶的单引号、双引号
     * perStringFormat(’<a href=”%1″ onclick=”alert(\’%2\’);”>%3</a>’, url, msg, text);
     * @param str
     * @returns {string}
     * @constructor
     */
    perStringFormat: function (str) {
        var args = arguments, re = new RegExp("%([1-" + args.length + "])”, “g");
        return String(str).replace(re, function ($1, $2) {
            return args[$2];
        });
    },
};