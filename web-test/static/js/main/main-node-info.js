$(function () {
        Vue.component('my-template', {
  template: '<div style="width:320px;z-index: 9999; position: fixed ! important; right: 15px; top: 120px;font-size: 8px;">' +
  '<Card dis-hover>\n' +
  '                    <div style="text-align:center">\n' +
  '                        <p>面板测试</p>\n' +
  '                    </div>\n' +
  '            </Card>'+
  '         </div>'

});
    var vue1 = new Vue({
        el:'#nodeInfo',
    });
});