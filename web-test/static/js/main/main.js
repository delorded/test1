$(function () {
    /****************add tabes ***************/
    NProgress.set(0.0);
    var query_type, query_value;
    var query_types = dtgl.query_types;
    $.each(query_types, function (index, value) {
        var temp = dtgl.request(value);
        if (temp != "") {
            query_type = value;
            query_value = temp;
            return false; //跳出当前循环 = break  true = continue
        }
    });
    // var the_url = "/api/v1/" + query_type + "/uthcrd?" + query_type + "=" + query_value;
    var the_url = dtgl.urls.online;
    the_url = the_url.format(query_type, query_type, query_value);
    // $('#main_south').hide();
    // var width = 960;
    // var height = 600;
    var height = $("#center").height() * 2;
    var width = $("#center").width() + 300;
    var img_w = 20;
    var img_h = 20;
    var edge_length = 200;//边长
    var radius = 10;    //圆形半径
    var mouse_click_flag = true;
    var mouse_dbclick_flag = false;
    var nodeInfoPanShow = true;//right node info pan mark

    var mouseXY = [0, 0];


    var root_data = "";
    NProgress.set(0.4);
    loadData();
    NProgress.set(1.0);

    //加载本地json 回路数据

    function loadData() {
        //异步加载数据
        d3.json("../static/json/useful_subgraph_bicycle.json", function (error, root) {
            if (error) {
                console.log(error);
            } else {
                root_data = root;
            }
            relation_map(root_data)

            // console.log(root);
            // console.log(root_data);
        });
    }

    function relation_map(root) {
        var zoom = d3.behavior.zoom().scaleExtent([-10, 10]).on("zoom", zoomed);

        function zoomed() {
            svg.attr("transform",
                "translate(" + zoom.translate() + ")" +
                "scale(" + zoom.scale() + ")"
            );
        }

        var svg = d3.select("#center").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .call(zoom)
            .append("g");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height);
        // console.log(root_data);
        //D3力导向布局
        var force = d3.layout.force()
            .nodes(root.nodes)
            .links(root.links)
            .size([width, height])
            .linkDistance(edge_length)
            // .friction(0.9)//摩擦力，0-1，越小带动运动越容易
            .charge(-1000)
            // .gravity(0)//所有点不向中心聚拢
            // .alpha(1)
            .start();

        //边
        var edges_line = svg.selectAll("line")
            .data(root.links)
            .enter()
            .append("line")
            .style("stroke", function (d) {
                // if(d.color="")return "#ccc";
                // else return d.color;
                return "#ccc";
            })
            .style("stroke-width", 1);

        //边上的文字（人物之间的关系）
        var edges_text = svg.selectAll(".linetext")
            .data(root.links)
            .enter()
            .append("text")
            .attr("class", "linetext")
            .text(function (d) {
                return d.relation;
            });

        var drag = force.drag()
            .on("dragstart", function (d, i) {
                d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
                dragstarted(d);
//                label_text_2.text("拖拽状态：开始");
            })
            .on("dragend", function (d, i) {
                dragended(d);
//                label_text_2.text("拖拽状态：结束");
            })
            .on("drag", function (d, i) {
//                label_text_2.text("拖拽状态：进行中");
                mouse_click_flag = false;
                dragged(d);
            });


        // 圆形图片节点（人物头像）
        var nodes_img = svg.selectAll("image")
            .data(root.nodes)
            .enter()
            .append("circle")
            //            .attr("class", "circleImg")
            .attr("r", function (d, i) {
                return d.size;
            })
            // .attr("id",function (d, i) {
            //     return d.name;
            // })
            .attr("fill", function (d, i) {

                //创建圆形图片
                var defs = svg.append("defs").attr("id", "imgdefs");

                var catpattern = defs.append("pattern")
                    .attr("id", "catpattern" + i)
                    .attr("height", 1)
                    .attr("width", 1);

                catpattern.append("image")
                    .attr("x", -(img_w / 2 - d.size))
                    .attr("y", -(img_h / 2 - d.size))
                    .attr("width", img_w)
                    .attr("height", img_h)
                    .attr("xlink:href", "../static/img/icon/" + d.image);

                return "url(#catpattern" + i + ")";

            })
            .on("mouseover", function (d, i) {
                //显示连接线上的文字
                edges_text.style("fill-opacity", function (edge) {
                    if (edge.source === d || edge.target === d) {
                        return 1.0;
                    }
                });
                edges_line.style("stroke-width", function (edge) {
                    if (edge.source === d || edge.target === d) {
                        return 1.0;
                    }
                })
                    .style("stroke", function (edge) {
                        if (edge.source === d || edge.target === d) {
                            //以后计算图回路，返回连通图的样式
                            if (edge.color = "#ccc") return "#0066FF";
                            else return edge.color
                        } else return "#ccc"
                    });
                // mouseMoveInTooltip(d, i);
                mouseXY[0] = d3.event.pageX;
                mouseXY[1] = d3.event.pageY;
                // mouseMoveInTooltip(d, i);
            })
            .on("mouseout", function (d, i) {
                //隐去连接线上的文字
                edges_text.style("fill-opacity", function (edge) {
                    if (edge.source === d || edge.target === d) {
                        return 0.0;
                    }
                });

                edges_line.style("stroke", function (edge) {
                    if (edge.source === d || edge.target === d) {
                        //以后计算图回路，返回连通图的样式
                        if (edge.color = "#0066FF") return "#ccc";
                        else return edge.color
                    } else return "#ccc"
                });

                mouseMoveOutTooltip();
            })
            .on("mousedown", function (d, i) {
                mouse_click_flag = true;
            })
            .on("mouseup", function (d, i) {
            })
            .on("dblclick", function (d, i) {
                mouse_dbclick_flag = true;
                d.fixed = false;
            })
            .on("click", function (d, i) {
                mouse_dbclick_flag = false;
                window.setTimeout(isClick, 500);

                function isClick() {
                    if (mouse_dbclick_flag) return false;
                    else {
                        if (!mouse_click_flag) return false;
                        else {
                            console.log("鼠标单击节点！");
                            console.log(d);
                            //这里写鼠标单击事件触发或产生的方法
                            mouseMoveInTooltip(d, i);

                        }
                    }
                }


            })
            .on("keyup", function (d, i) {
                console.log(d, i)
            })
            .call(drag);//force.drag


        /* 添加提示框*/

        nodes_img.append("title")
        //            .attr("class","dt_tip")
            .html(function (d, i) {
                // nodeMoveInToolTip(d);
                var txt = d.name + "<br><hr style='border: #5a5a5a solid 1px;'>";
                var dt_html = "<div class='dt_tip' style='height: 20px;width: 40px;font-size: 20px;'>" + txt + "</div>";
                return dt_html;
            });

        var tooltip = d3.select("body").append("div")
            .attr("class", "nodetooltip") //用于css设置类样式
            .attr("opacity", 0.0);
        //鼠标移入：

        //设置tooltip文字
        mouseMoveInTooltip = function (d, i) {
            $('.nodetooltip').show();
            var btn_id = "btn_" + d.name;
            var btn_id_arry = ["1_" + btn_id, "2_" + btn_id, "3_" + btn_id, "4_" + btn_id];
            var title_html = d.name + "<br><hr style='border: #5a5a5a solid 1px;'>" +
                "<div style='color: #0074d9;font-size: 4px;'>" +
                "邮箱[]域名[]文件[]IP[]<br>人员[]密码[]</div>" +
                "<div class=\"btn-group btn-group-xs\">" +
                "   <button type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\n" +
                "       <span class=\"glyphicon glyphicon-paperclip\" aria-hidden=\"true\">&nbsp;查询</span>\n" +
                "   </button>" +
                "   <button  type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\n" +
                "       <span class=\"glyphicon glyphicon-random\" aria-hidden=\"true\">&nbsp;扩展</span>\n" +
                "   </button>" +
                "   <button type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\n" +
                "       <span class=\"glyphicon glyphicon-globe\" aria-hidden=\"true\">&nbsp;更新</span>\n" +
                "   </button>" +
                "   <button type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\n" +
                "       <span class=\"glyphicon glyphicon-download\" aria-hidden=\"true\">&nbsp;下载</span>\n" +
                "   </button>" +
                "   <button  type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\">\n" +
                "       <span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\">&nbsp;关闭</span>\n" +
                "   </button>" +
                "</div>"

            tooltip.html(title_html)
                .attr("id", d.name)
                //设置tooltip的位置(left,top 相对于页面的距离)
                .style("left", (mouseXY[0] + 10) + "px")//.style("left",(d3.event.pageX)+"px")
                .style("top", (mouseXY[1] + 10) + "px")//.style("top",(d3.event.pageY-30)+"px")
                .style("opacity", 1.0);
            $('.glyphicon.glyphicon-paperclip').click(function () {
                //查询
                nodeInfoQuery(d);
            });
            $('.glyphicon.glyphicon-random').click(function () {
                //节点扩展
            });
            $('.glyphicon.glyphicon-download').click(function () {
                //节点数据下载
            });
            $('.glyphicon.glyphicon-remove').click(function () {
                //关闭节点显示
                $('.nodetooltip').hide();
            });

            // $('node_tooltip'.)
        };
        mouseMoveOutTooltip = function () {
            // tooltip.style("opacity",0.0);
        };


        var text_dx = -20;
        var text_dy = 20;

        var nodes_text = svg.selectAll(".nodetext")
            .data(root.nodes)
            .enter()
            .append("text")
            .attr("class", "nodetext")
            .attr("dx", text_dx)
            .attr("dy", text_dy)
            .text(function (d) {
                var nameLength = d.name.length;
                if (nameLength > 9) return d.name.substr(0, 3) + "**" + d.name.substr(nameLength - 3, 3);
                else return d.name;
            });


        force.on("tick", function () {

            //限制结点的边界
            root.nodes.forEach(function (d, i) {
                d.x = d.x - img_w / 2 < 0 ? img_w / 2 : d.x;
                d.x = d.x + img_w / 2 > width ? width - img_w / 2 : d.x;
                d.y = d.y - img_h / 2 < 0 ? img_h / 2 : d.y;
                d.y = d.y + img_h / 2 + text_dy > height ? height - img_h / 2 - text_dy : d.y;
            });

            //更新连接线的位置
            edges_line.attr("x1", function (d) {
                return d.source.x;
            });
            edges_line.attr("y1", function (d) {
                return d.source.y;
            });
            edges_line.attr("x2", function (d) {
                return d.target.x;
            });
            edges_line.attr("y2", function (d) {
                return d.target.y;
            });

            //更新连接线上文字的位置
            edges_text.attr("x", function (d) {
                return (d.source.x + d.target.x) / 2;
            });
            edges_text.attr("y", function (d) {
                return (d.source.y + d.target.y) / 2;
            });


            //更新结点图片和文字
            nodes_img.attr("cx", function (d) {
                return d.x
            });
            nodes_img.attr("cy", function (d) {
                return d.y
            });

            //更新节点坐标位置
            nodes_text.attr("x", function (d) {
                return d.x
            });
            nodes_text.attr("y", function (d) {
                return d.y + img_w / 4;
            });
        });

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
//            d3.select(this).classed("dragging", true);
        }

        function dragged(d) {
//            d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        }

        function dragended(d) {
//            d3.select(this).classed("dragging", false);
        }
    };


    // $('#dt_dwn_cvs').popover({
    //     html: true,
    //     title: '数据下载',
    //     delay: {show: 100, hide: 100},
    //     trigger: "hover",
    //     content: '点击下载csv格式数据',
    //     container: "body",
    //     placement: "right",
    //     toggle: 'popover'
    // });
    function nodeMoveInToolTip(node) {
        $("'#" + node.name + "'").confirmation({
            animation: true,
            placement: "top",
            title: node.name,
            btnOkLabel: '扩展关联',
                      btnCancelLabel: '下载信息',
            // container:true,
            onConfirm: function () {
                var down_url = "/api/v1/" + query_type + "/down/thcrd?" + query_type + "=" + query_value;
                window.location.href = down_url;
                //window.open('http://www.parkingcrew.net/privacy.html', 'pcrew_policy', 'width=890,height=330,left=200,top=200,menubar=no,status=yes,toolbar=no');
            },
            onCancel: function () { //alert("点击了取消");

            }
        })
    }

    $('#dt_dwn_cvs').confirmation({
        animation: true,
        placement: "right",
        title: "下载cvs文件",
        btnOkLabel: '确定',
        btnCancelLabel: '取消',
        // container:true,
        onConfirm: function () {
            var down_url = "/api/v1/" + query_type + "/down/thcrd?" + query_type + "=" + query_value;
            //window.open('http://www.parkingcrew.net/privacy.html', 'pcrew_policy', 'width=890,height=330,left=200,top=200,menubar=no,status=yes,toolbar=no');
        },
        onCancel: function () { //alert("点击了取消");

        }
    });

    $('#dt_dwn_cvs').click(function () {
        //download
        //http://127.0.0.1:8000/api/v1/hash/down/thcrd?hash=88a6f0e237c9580b13f10bfa920e331b
        var down_url = "/api/v1/" + query_type + "/down/thcrd?" + query_type + "=" + query_value;
        // window.location.href = down_url;
    });

    $('#dt_fresh').click(function () {
        d3.select("#center").selectAll("svg").remove();
        d3.select("body").selectAll(".nodetooltip").remove();
        relation_map(root_data);
    })
    $('#nodeInfoPan').hide();

    $('#dt_right_muen').click(function () {
        if (nodeInfoPanShow) {
            $('#nodeInfoPan').show(200);
        } else {
            $('#nodeInfoPan').hide(200);
        }
        nodeInfoPanShow = !nodeInfoPanShow;
    });

    function nodeInfoQuery(node) {
        console.log(node.name);
        $('#dt_right_muen').click();
    }

    var northIsHide = false;
    $('#dt_muen').click(function () {

        if (northIsHide) {
            $('#north').show(200);
            $('.nodetooltip').show();
            $('.layout-panel-center').css({"top": "55px", "height": "auto"});
        }
        else {
            $('#north').hide(200);
            $('.nodetooltip').hide();
            $('.layout-panel-center').css({"top": "0px", "height": "auto"});
        }
        northIsHide = !northIsHide;
    });
});