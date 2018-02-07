
$(function () {
    // export default {};
    var query_type,query_value;
    var query_types=dtgl.query_types;
    $.each(query_types,function (index,value) {
        var temp = dtgl.request(value);
        if(temp!=""){
            query_type = value;
            query_value = temp;
            return false; //跳出当前循环 = break  true = continue
        }
    });
    $('#query_value_input').val(query_value);
    // console.log(query_type+"="+query_value)

    // #query_value_btn
    $('#query_value_btn').click(function(){
        query_value = $('#query_value_input').val();
        query_value = dtgl.trim(query_value,true).toLowerCase();
        if(query_value == "" || query_value==null || query_value===NaN || query_value==undefined){
            return
        }
        if(dtgl.isIp(query_value)){
            query_type="ip";
        }else if(dtgl.isEmail(query_value)){
            query_type="email"
        }else if(dtgl.isDomain(query_value)){
            query_type="domain"
        }else if(dtgl.isHash(query_value)){
            query_type="hash"
        }else return;
        // onsole.log(query_type+"="+query_value)
        location.href = '../main/query?' + query_type+"=" + query_value;
    });

    $('#dt_query_data').attr("title",query_value);
    // ('#dt_query_data').html();
    // $('#dt_query_data').attr(query_value);
    $('#dt_query_data')[0].innerText = query_value;
    console.log($('#dt_query_data'));
    // console.log($('#dt_query_data').title());
    // console.log($('#dt_query_data').text(query_value));


});