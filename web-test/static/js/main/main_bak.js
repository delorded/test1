$(function () {
    /****************add tabes ***************/

    // $('#dt_main_tabs').tabs('add',{
    //   title:'New Tab',
    //   content:'Tab Body',
    //   closable:true,
    //   tools:[{
    //     iconCls:'icon-mini-refresh',
    //     handler:function(){
    //       alert('refresh');
    //     }
    //   }]
    // });
    // var isQueryInThePage = false;
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
    var the_url = "/api/v1/"+query_type+"/uthcrd?"+query_type+"="+query_value;

    // var width = 960;
    // var height = 600;
    var height = $("#center").height() + 200;
    var width = $("#center").width() + 300;
    //取得20个颜色的序列,color是一个方法 使用为color() 将返回一个颜色的序列号，如："#1f77b4"
    var color = d3.scale.category20();
    //定义画布
    var svg = d3.select("#center").append("svg")
        .attr("width", width)
        .attr("height", height);
    //定义力学结构
    var force = d3.layout.force()
        .charge(-500)//获取或设置节点的电荷数.(电荷数决定结点是互相排斥还是吸引)
        .linkDistance(200)//获取或设置节点间的连接线距离.
        .size([width, height]);//获取或设置布局的 宽 和 高 的大小
    //读取数据
    //   http://127.0.0.1:8000/api/v1/domain/uthcrd?domain=twadcorp.com
    ///api/v1/domain/uthcrd?domain=twadcorp.com
    d3.json(the_url, function (error, graph) {  //url:force.php  ../static/json/thcrd-test.json
        console.log(graph.nodes);
        console.log(graph.links);
        force.nodes(graph.nodes).links(graph.links).start();
//定义连线
        var link = svg.selectAll(".link")
        // .data(graph.links)
            .data(graph.links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke", "#222")
            .attr("stroke-opacity", "0.4")
            .style("stroke-width", 1);
//定义节点标记
        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .call(force.drag);
//节点圆形标记
        node.append("circle")
            .attr("class", "node")
            .attr("r", function (d) {
                return 10;
            }) //.attr("r",function(d){return 10+d.group;})
            //.style("fill", function(d) { return color(d.group); });//
            .style("fill", function (d) {
                // colorRandom = siteColor(d.data.name);
                // return color(d.group);
                return d.color;
            });
//标记鼠标悬停的标签
        node.append("title")
            .text(function (d) {
                return d.name + "\n——————————\n类型：@mail" + "\n详细：" + "\n时间：2017-07-01" + "\n标签：重要|病毒|APT报告";
            });
//节点上显示的姓名
        node.append("text")
            .attr("dy", ".3em")
            .attr("class", "nodetext")
            .style("text-anchor", "middle")
            // .text(function(d) { return d.name; });
            .text(function (d) {
                return d.name;
            });
//开始力学动作
        force.on("tick", function () {
            link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

        // force.on("tick",function () {
        //     link.attr("x1", function(d) { return d.data.source.x; })
        //     .attr("y1", function(d) { return d.data.source.y; })
        //     .attr("x2", function(d) { return d.data.target.x; })
        //     .attr("y2", function(d) { return d.data.target.y; });
        //   node.attr("transform", function(d){ return "translate("+d.data.x+"," + d.data.y + ")";});
        // })
    });

    $('#dt_dwn_cvs').popover({
        html:true,
        title:'数据下载',
        delay:{show:100,hide:100},
        trigger:"hover",
        content:'点击下载csv格式数据',
        container:"body",
        placement:"right",
        toggle:'popover'
    });

    $('#dt_dwn_cvs').click(function () {
        //download
        //http://127.0.0.1:8000/api/v1/hash/down/thcrd?hash=88a6f0e237c9580b13f10bfa920e331b
        var down_url = "/api/v1/"+ query_type+"/down/thcrd?"+query_type+"="+query_value;
        window.location.href = down_url;
    });
});