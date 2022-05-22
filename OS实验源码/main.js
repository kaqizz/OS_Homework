class PCB {
  constructor(pid,need_time,priority,state,property,fore_name,back_name,size) {
    this.pid = pid; //进程名
    this.need_time = parseInt(need_time);  //进程剩余运行时间
    this.priority = parseInt(priority);   //进程优先级
    this.state = parseInt(state);  //0--后备队列  1-就绪  2-运行在处理机A  3-运行在处理机B  4-挂起
    this.property = property;   //1-同步进程   0-独立进程
    this.fore_name = fore_name===undefined?[]:fore_name.split(",");  //进程前驱节点
    this.back_name = back_name===undefined?[]:back_name.split(",");  //进程后继节点
    this.MLT = new MLT(size);       //进程所需内存大小
  }
}
//memory location
class MLT{
  constructor(size) {
    this.size = parseInt(size);
  }
}

d3.csv("data1.csv")
    .then(data=>{
      console.log(data);
      let back_queue = [];
      let ready_queue = [];
      let hangUp_queue = [];
      //将数据压入后备队列
      for(let i =0;i<data.length;i++){
        let temp = new PCB(data[i].pid,data[i].need_time,data[i].priority,data[i].state,data[i].property,data[i].fore_name,data[i].back_name,data[i].size);
        temp.fore = [];
        temp.back = [];
        back_queue.push(temp);
      }
      //利用前驱后继名来连接前驱后继  便于以后查找后继
      for (let i = 0; i < data.length; i++) {
        if (back_queue[i].property) {
          for (let w = 0; w < data.length; w++) {
            if ((back_queue[i].fore_name.find((v, i, a) => v === back_queue[w].pid)) !== undefined) {
              back_queue[i].fore.push(back_queue[w]);
            }

            if ((back_queue[i].back_name.find((v, i, a) => v === back_queue[w].pid)) !== undefined) {
              back_queue[i].back.push(back_queue[w]);
            }
          }
        }
      }
      back_queue.sort((a,b)=>{return b.priority - a.priority;});
      console.log(back_queue);

      let channel = 2;//道数暂定为3 道数也需要输入
      let readyQueue_maxSize = Math.round(channel*1.5);
      //画图
      let r = 30;
      let memory_width = 300;
      let memory_height = 600;
      let svg = d3.select("svg");
      //就绪队列
      svg.append("text")
          .attr("id","back_text")
          .attr("x",(600 + readyQueue_maxSize * r * 2) / 2 - 50)
          .attr("y",50)
          .text("就绪队列 道数为:" + channel);
      svg.append("rect")
          .attr("class","ready_queue")
          .attr("width",readyQueue_maxSize * r * 2)
          .attr("height",r * 2)
          .attr("x",300)
          .attr("y",70);
      //后备队列
      svg.append("text")
          .attr("id","back_text")
          .attr("x",20)
          .attr("y",350)
          .text("后备队列");
      svg.append("rect")
          .attr("class","back_queue")
          .attr("width",r * 2)
          .attr("height",r * 16)
          .attr("x",100)
          .attr("y",150);
      //挂起队列
      svg.append("text")
          .attr("id","hangUp_text")
          .attr("x",(600 + readyQueue_maxSize * r * 2) / 2 - 25)
          .attr("y",680)
          .text("挂起队列");
      svg.append("rect")
          .attr("class","hangUp_queue")
          .attr("width",readyQueue_maxSize * r * 2)
          .attr("height",r * 2)
          .attr("x",300)
          .attr("y",600);
      //处理机A
      svg.append("text")
          .attr("id","cpuA_text")
          .attr("x",800)
          .attr("y",255)
          .text("处理机A");
      svg.append("rect")
          .attr("class","cpu")
          .attr("width",r * 3)
          .attr("height",r * 3)
          .attr("x",700)
          .attr("y",200);

      //处理机B
      svg.append("text")
          .attr("id","cpuA_text")
          .attr("x",800)
          .attr("y",495)
          .text("处理机B");
      svg.append("rect")
          .attr("class","cpu")
          .attr("width",r * 3)
          .attr("height",r * 3)
          .attr("x",700)
          .attr("y",450);

      //内存
      svg.append("text")
          .attr("id","memory_text")
          .attr("x",900 + memory_width/2 - 50)
          .attr("y",30)
          .text("内存(大小为500)");
      svg.append("text")
          .attr("id","start_text")
          .attr("x",900 + memory_width + 20)
          .attr("y",55)
          .text("0");
      svg.append("text")
          .attr("id","end_text")
          .attr("x",900 + memory_width + 20)
          .attr("y",55 + memory_height)
          .text("500");
      svg.append("rect")
          .attr("id","memory")
          .attr("width",memory_width)
          .attr("height",memory_height)
          .attr("x",900)
          .attr("y",50);


      let g = svg.selectAll("circle_g")
          .data(back_queue,d=>d.pid)
          .enter()
          .append("g")
          .attr("class",function (d,i) {
           if(i<channel){
             return "not_back_g ready_g circle_g"
           }
           else{
             return 'back_g circle_g'
           }
          })
          .attr("transform", (d,i) => {
            let x = 100+r;
            let y = 150 + r + 2 * i * r;
            return `translate(${x},${y})`
          });

      g
          .append("circle")
          .attr("cx",0)
          .attr("cy",0)
          .attr("r",r);

      g
          .append("text")
          .attr("class","pid_text")
          .attr("x",(d,i)=>0)
          .attr("y",(d,i)=>-10)
          .attr("text-anchor", "middle")
          .text(d=>"pid:" + d.pid);

      g
          .append("text")
          .attr("class","nt_text")
          .attr("x",(d,i)=>0)
          .attr("y",(d,i)=>5)
          .attr("text-anchor", "middle")
          .text(d=>"nt:" + d.need_time);

      g
          .append("text")
          .attr("class","pr_text")
          .attr("x",(d,i)=>0)
          .attr("y",(d,i)=>20)
          .attr("text-anchor", "middle")
          .text(d=>"pr:" + d.priority);




      //将后备队列不断压入就绪队列  在此之前能放多少需要看内存分配
      {
        let total_size = 0;
        let i;
        for (i = 0; i < back_queue.length; i++) {
          total_size += back_queue[i].MLT.size;
          if (total_size > 500) {
            break;
          }
        }
        let time = 0;
        while (ready_queue.length < channel && back_queue.length > 0 && time < i) {
          back_queue[0].state = 1;//处于就绪队列状态
          ready_queue.push(back_queue[0]);//取第一个
          back_queue.splice(0, 1);//删除第一个元素
          time++;
        }
      }

      //第一个动画  circle从后备队列进入就绪队列
       {
         //在这里才设定就绪g的class  只需要改变原来是就绪队列的某些节点  ready_g
         {
           d3.selectAll(".circle_g")
               .attr("computed",function (d,i) {  //计算该circle的类
                 if(back_queue.includes(d)===true){
                   d3.select(this).classed("ready_g",false);
                   d3.select(this).classed("not_back_g",false);
                   d3.select(this).classed("back_g",true);
                 }
               })
         }
      d3.selectAll(".ready_g").transition()
          .duration(1000)
          .delay(200)
          .attr("transform", (d,i) => {
            let x = 300 + readyQueue_maxSize * r * 2 - i * 2 * r - r;
            let y = 70 + r;
            return `translate(${x},${y})`
          });
      d3.selectAll(".back_g")
          .transition()
          .duration(1000)
          .delay(200)
          .attr("transform", (d,i) => {
            let x = 100+r;
            let y = 150 + r + 2 * i * r;
            return `translate(${x},${y})`;
          });

         let memory_g = svg.selectAll(".memory_g")
             .data(ready_queue,d=>d.pid)
             .enter()
             .append("g")
             .attr("class","memory_g")
             .attr("transform",function (d,i) {
               let x = 1500;
               let y;
               if(i===0){
                 d.MLT.start = 0;
                 y = 50;
               }
               else{
                 let pre_start = ready_queue[i-1].MLT.start;
                 let pre_size = ready_queue[i-1].MLT.size;
                 d.MLT.start = pre_start + pre_size;
                 y = 50 +(d.MLT.start / 500 * memory_height);
               }
               return `translate(`+ x + `,` + y + ')';
             })
             //设置相对平滑的动画
             memory_g
             .transition()
             .duration(1000)
             .delay(200)
             .attr("transform",function (d,i) {
               let x = 900;
               let y;
               if(i===0){
                 d.MLT.start = 0;
                 y = 50;
               }
               else{
                 let pre_start = ready_queue[i-1].MLT.start;
                 let pre_size = ready_queue[i-1].MLT.size;
                 d.MLT.start = pre_start + pre_size;
                 y = 50 +(d.MLT.start / 500 * memory_height);
               }
               return `translate(`+ x + `,` + y + ')';
             })
                 .on("end",function () {
                   d3.select(this)
                       .append("text")
                       .attr('x',memory_width / 2 - 30)
                       .attr("y", (d,i)=>(d.MLT.size) / 2 / 500 * memory_height)
                       .text((d)=>"进程" + d.pid)
                 })

         //首次适应  由于从后备队列中依次进入就绪队列 那么在这个最开始的时候 首次适应就是按顺序的了
         memory_g.append("rect")
             .attr("x",0)
             .attr("y",0)
             .attr("width",memory_width)
             .attr("height",(d,i)=>d.MLT.size / 500 * memory_height);
         memory_g.append("text")
             .attr('x',memory_width + 20)
             .attr("y", 5)
             .text((d)=>d.MLT.start)
         memory_g.append("text")
             .attr('x',memory_width + 20)
             .attr("y",(d,i)=>d.MLT.size / 500 * memory_height + 5)
             .text((d)=>d.MLT.size + d.MLT.start)


       }
          click_event();
      //挂起队列前往就绪队列  解挂

      //处理单个时间片运行
      d3.select("#cBtn").on("click",function () {
        click_event();
        //数据处理
        {
          for (let  i = 0; i < ready_queue.length; i++) {
            ready_queue[i].state = 1; //表示刚开始的时候会使得没有进程处于处理机
          }
          ready_queue.sort((a, b) => {
            return b.priority - a.priority;
          })

          let isDelete = false;
          let cur_index = 0;
          for (cur_index = 0; cur_index < ready_queue.length; cur_index++) {
            if (ready_queue[cur_index].fore.length === 0) {
              console.log("a");
              //没有前驱节点
              ready_queue[cur_index].state <<= 1;  //放入第一个处理机
              ready_queue[cur_index].need_time--;
              ready_queue[cur_index].priority--;
              if (ready_queue[cur_index].need_time === 0) {
                //删除后继节点的该前驱节点指针
                let pre_ptr = ready_queue[cur_index];
                for (let i = 0; i < ready_queue[cur_index].back.length; i++)//清除删除节点的每个后续队列的进程的每个该前驱队列
                {
                  //删指针
                  for (let j = 0; j < ((ready_queue[cur_index].back[i])).fore.length; j++) {
                    if (((ready_queue[cur_index].back[i])).fore[j] === pre_ptr) {
                      ((ready_queue[cur_index].back[i])).fore.splice(j, 1);
                      break;
                    }
                  }
                  //删名字  便于后续展示
                  for (let j = 0; j < ((ready_queue[cur_index].back[i])).fore_name.length; j++) {
                    if (((ready_queue[cur_index].back[i])).fore_name[j] === pre_ptr.pid) {
                      ((ready_queue[cur_index].back[i])).fore_name.splice(j, 1);
                      break;
                    }
                  }
                }
                //删除该节点
                ready_queue.splice(cur_index,1);
                isDelete = true;
                //从后备队列中继续加入就绪队列

              }
              break;
            }
          }

          cur_index++;
          if(isDelete)cur_index--;
          for (; cur_index < ready_queue.length; cur_index++) {
            if (ready_queue[cur_index].fore.length === 0) {
              console.log("b")
              //没有前驱节点
              ready_queue[cur_index].state = 3;  //放入第一个处理机
              ready_queue[cur_index].need_time--;
              ready_queue[cur_index].priority--;
              if (ready_queue[cur_index].need_time === 0) {
                //删除后继节点的该前驱节点指针
                let pre_ptr = ready_queue[cur_index];
                for (let i = 0; i < ready_queue[cur_index].back.length; i++)//清除删除节点的每个后续队列的进程的每个该前驱队列
                {
                  //删指针
                  for (let j = 0; j < ((ready_queue[cur_index].back[i])).fore.length; j++) {
                    if (((ready_queue[cur_index].back[i])).fore[j] === pre_ptr) {
                      ((ready_queue[cur_index].back[i])).fore.splice(j, 1);
                      break;
                    }
                  }
                  //删名字  便于后续展示
                  for (let j = 0; j < ((ready_queue[cur_index].back[i])).fore_name.length; j++) {
                    if (((ready_queue[cur_index].back[i])).fore_name[j] === pre_ptr.pid) {
                      ((ready_queue[cur_index].back[i])).fore_name.splice(j, 1);
                      break;
                    }
                  }
                }
                //删除该节点
                ready_queue.splice(cur_index,1);
                isDelete = true;
                //从后备队列中继续加入就绪队列
              }
              break;
            }
          }
          //完成前面所以的动作之后才  也必须要添加

          //添加查看内存情况  再添加进入就绪队列
          while (ready_queue.length < channel && back_queue.length > 0) {   //最终会达到等于
            // 0---内存起始值   500----内存大小
            let ret = isInQueue(ready_queue,back_queue[0],0,500);
            if(ret.result) {
              (back_queue[0]).state = 1;  //处于就绪队列状态
              back_queue[0].MLT.start = ret.start;
              ready_queue.push(back_queue[0]);
              back_queue.splice(0, 1);//删去第一个元素 可能有bug
            }
            else break;
          }

        }
        //动画
        {
          circle_change()
        }
      })//onClick

      let new_data = [];
      let new_data_index = 0;
      d3.csv("new_data.csv")
          .then((_new_data)=>{
            new_data = _new_data;
          });
    //添加新数据newData1按钮  但是新按钮只能导入一次/或者点击一次导入一个
      d3.select("#nData")
          .on("click",function () {
            if(new_data_index<new_data.length) {
              let new_pcb = new PCB(new_data[new_data_index].pid, new_data[new_data_index].need_time, new_data[new_data_index].priority, new_data[new_data_index].state, new_data[new_data_index].property, new_data[new_data_index].fore_name, new_data[new_data_index].back_name, new_data[new_data_index].size);
              new_data_index++;
              new_pcb.fore = [];
              new_pcb.back = [];
              back_queue.push(new_pcb);
              //增加新进程 需要重画
              let g = svg.selectAll(".back_g")
                  .data(back_queue, d => d.pid)
                  .enter()
                  .append("g")
                  .attr("class", "back_g circle_g")
                  .attr("transform", (d, i) => {
                    let x = 100 + r;
                    let y = 650;
                    return `translate(${x},${y})`
                  });
              g
                  .transition()
                  .duration(1000)
                  .delay(200)
                  .attr("transform", (d, i) => {
                    let x = 100 + r;
                    let y = 150 + r + 2 * i * r;
                    return `translate(${x},${y})`
                  });

              g
                  .append("circle")
                  .attr("cx", 0)
                  .attr("cy", 0)
                  .attr("r", r);

              g
                  .append("text")
                  .attr("class", "pid_text")
                  .attr("x", (d, i) => 0)
                  .attr("y", (d, i) => -10)
                  .attr("text-anchor", "middle")
                  .text(d => "pid:" + d.pid);

              g
                  .append("text")
                  .attr("class", "nt_text")
                  .attr("x", (d, i) => 0)
                  .attr("y", (d, i) => 5)
                  .attr("text-anchor", "middle")
                  .text(d => "nt:" + d.need_time);

              g
                  .append("text")
                  .attr("class", "pr_text")
                  .attr("x", (d, i) => 0)
                  .attr("y", (d, i) => 20)
                  .attr("text-anchor", "middle")
                  .text(d => "pr:" + d.priority);
            }
            else{
              if (confirm("已无新数据")===true){
                return true;  //你也可以在这里做其他的操作
              }else{
                return false;
              }
            }
            click_event();
          })
      function isInQueue(ready_queue, inPcb, start, size) {
        if(ready_queue.length===0){
          return {
            start: 0,
            result: true
          }
        }
        let starts = [];
        let ends = [];
        for(let x of ready_queue){
          starts.push(x.MLT.start);
          ends.push(x.MLT.start + x.MLT.size);
        }
        starts.sort((a,b)=>a-b);
        ends.sort((a,b)=>a-b);
        //首次适应算法
        let gap = starts[0] - start;
        if(gap >= inPcb.MLT.size){
          return {
            "result":true,
            "start":start
          }
        }
        for(let i =0;i<starts.length - 1;i++){
          if(starts[i+1] - ends[i] >= inPcb.MLT.size){
            return {
              "result":true,
              "start":ends[i]
            }
          }
        }
        if(start + size - ends[ends.length-1] >= inPcb.MLT.size){
          return {
            "result":true,
            "start":ends[ends.length-1]
          }
        }
        else{
          if (confirm("后备队列有进程因内存不够而无法进入就绪队列")===true){
            //
          }
          return {
            "result":false
          }
        }
      }


      function memory_change() {
        //内存动画
        let memory_g = svg.selectAll(".memory_g").data(ready_queue, d => d.pid)  //绑定新数据的新集和
        console.log("bbb")
            memory_g
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
              let x = 1500;
              let y;
              y = 50 + (d.MLT.start / 500 * memory_height);
              return `translate(` + x + `,` + y + ')';
            })
            .attr("class", "memory_g new_g")
            .merge(memory_g);
    //仅仅对新加进来的进行移动
        svg.selectAll(".new_g")
            .transition()
            .duration(1000)
            .delay(200)
            .attr("transform", function (d, i) {
              let x = 900;
              let y;
              y = 50 + (d.MLT.start / 500 * memory_height);
              return `translate(` + x + `,` + y + ')';
            });
        memory_g
            .exit()
            .transition()
            .duration(500)
            .attr("transform", function (d, i) {
              let x = 1500;
              let y;
              if (i === 0) {
                d.MLT.start = 0;
                y = 50;
              } else {
                let pre_start = ready_queue[i - 1].MLT.start;
                let pre_size = ready_queue[i - 1].MLT.size;
                d.MLT.start = pre_start + pre_size;
                y = 50 + (d.MLT.start / 500 * memory_height);
              }
              return `translate(` + x + `,` + y + ')';
            })
            .remove();

        //需要对new_g进行添加rect和text  然后把这个类去掉!!!!!!!!!!!!!!!!!!!!!!!
       let new_g = svg.selectAll(".new_g");
        new_g.append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width",memory_width)
            .attr("height",(d,i)=>d.MLT.size / 500 * memory_height);
        new_g.append("text")
            .attr('x', memory_width + 20)
            .attr("y", 5)
            .text((d) => d.MLT.start)
        new_g.append("text")
            .attr('x', memory_width + 20)
            .attr("y", (d, i) => d.MLT.size / 500 * memory_height + 5)
            .text((d) => d.MLT.size + d.MLT.start)
        new_g
            .append("text")
            .attr('x', memory_width / 2 - 30)
            .attr("y", (d, i) => (d.MLT.size) / 2 / 500 * memory_height)
            .text((d) => "进程" + d.pid);
        console.log("ddd")
        new_g.classed("new_g",false);
        console.log("eee")
      }

      function circle_change() {
        let t = 0;
        //突然发现一点  绑定对象的话 就相当于是一次赋值 而对象是赋值地址 也就是说后续不需要再绑定数据了其实!!!  除非要删除元素
        d3.selectAll(".back_g")
            .attr("computed",function () {
              let data = this.__data__;
              if(data.state!==0){
                d3.select(this).classed("back_g",false).classed("ready_g",true).classed("not_back_g",true);
              }

            })
        //移动小球  在移动后消失可以再优化一下
        d3.selectAll(".ready_g")
            .transition()
            .duration(1000)
            .delay(200)
            .attr("transform", (d,i) => {
              let x;
              if(d.state===2||d.state===3){
                x = 745;
              }
              else{
                x = 300 + readyQueue_maxSize * r * 2 - t * 2 * r - r;
                t++;
              }
              let y;
              if(d.state===2){
                y = 245;
              }
              else if(d.state===3){
                y = 495;
              }
              else{
                y = 70 + r;
              }
              return `translate(${x},${y})`
            })
            .on("end",function () {
              console.log("end_node")
              d3.selectAll(".ready_g")
                  .data(ready_queue,d=>d.pid)
                  .exit()
                  .remove()
            })



        d3.selectAll(".nt_text")
            .transition()
            .duration(1000)
            .delay(200)
            .text(d=> "nt:"+ d.need_time);
        d3.selectAll(".pr_text")
            .transition()
            .duration(1000)
            .delay(200)
            .text(d=> "pr:" + d.priority);

        memory_change();

        t = 0
        //改变后备队列
        let back_g = svg.selectAll(".back_g")
                        .transition()
                        .duration(1000)
                        .delay(200)
                        .attr("transform", (d, i) => {
                          let x = 100 + r;
                          let y = 150 + r + 2 * t * r;
                          t++;
                          console.log(t)
                          return `translate(${x},${y})`
                        });
      }

      function click_event() {
        d3.selectAll(".circle_g")
            .on("mouseover",null)
            .on("mouseout",null)
            .on("click",null);
        d3.selectAll(".not_back_g")
            .on("click",function (e,d) {
              //点击挂起之后后备队列可进就一定要进!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
              let ready = d3.select(this).classed("ready_g");
              let hangUp = d3.select(this).classed("hangUp_g");
              d3.select(this).classed("ready_g",!ready);
              d3.select(this).classed("hangUp_g",!hangUp);
              let this_circle = this;
              let isChanged = true;
              if(ready){//点的是就绪队列的话 就可以从后备队列里新增到就绪队列
                d.state = 4; //如果第一个事件段也是可挂起的那么就需要加一个动画了
                hangUp_queue.push(d);
                ready_queue.splice(ready_queue.findIndex(((value, index, obj) => value === d)),1)
                //新增就绪队列  --其实可以封装成一个函数
                while (ready_queue.length < channel && back_queue.length > 0) {   //最终会达到等于
                  // 0---内存起始值   500----内存大小
                  let ret = isInQueue(ready_queue,back_queue[0],0,500);
                  if(ret.result) {
                    (back_queue[0]).state = 1;  //处于就绪队列状态
                    back_queue[0].MLT.start = ret.start;
                    ready_queue.push(back_queue[0]);
                    back_queue.splice(0, 1);//删去第一个元素 可能有bug
                  }
                  else break;
                }
                //end
              }
              else{  //而从挂起队列进入就绪队列是强制的
                d.state = 1; //如果第一个事件段也是可挂起的那么就需要加一个动画了
                let ret = isInQueue(ready_queue,d,0,500);
                if(ret.result) {
                  d.MLT.start = ret.start;
                  ready_queue.push(d);
                  hangUp_queue.splice(hangUp_queue.findIndex(((value, index, obj) => value === d)), 1)
                }
                else{
                  if (confirm("挂起队列因内存不够而无法解挂")===true){
                    isChanged = false;
                    d3.select(this_circle).classed("ready_g",ready);
                    d3.select(this_circle).classed("hangUp_g",hangUp);
                  }

                }
              }
              //这里其实有个很神奇的地方!!!!!!!!!就是我移除就绪队列的一个后 再移进一个的话仍然会保持有序 大概理解了一下 原因就是选集内部顺序其实是没有变化的 只是单纯的第一次没有选上第一个  第二次选上了(因为没有重新绑定数据可能)
              if(isChanged) {
                d3.selectAll(".hangUp_g")
                    .transition()
                    .duration(1000)
                    .attr("transform", (d, i) => {
                      let x = 300 + r + 2 * i * r;
                      let y = 600 + r;
                      return `translate(${x},${y})`
                    });
                d3.selectAll(".ready_g")
                    .transition()
                    .duration(1000)
                    .attr("transform", (d, i) => {
                      let x = 300 + readyQueue_maxSize * r * 2 - i * 2 * r - r;
                      let y = 70 + r;
                      return `translate(${x},${y})`
                    });


                circle_change();
              }
            });
        //点击新进程也要加入!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        d3.selectAll(".circle_g").on("mouseover",function () {
          let data = this.__data__;
          d3.select("#tooltip")
              .classed("hidden",false);

          let transform = d3.select(this).attr("transform");
          let xPosition = parseFloat(transform.substring(10,transform.indexOf(","))) + 160;
          let yPosition = parseFloat(transform.substring(transform.indexOf(",") + 1,transform.indexOf(")"))) + 30;
          if(data.state===4){
            xPosition += 20
            yPosition -= 200;
          }

          let tooltip = d3.select("#tooltip")
              .style("left", xPosition + "px")
              .style("top", yPosition + "px")
          //tooltip

          tooltip.select("#pid")
              .text(data.pid);
          tooltip.select("#property")
              .text(data.property==='1'?'同步进程':'独立进程');
          tooltip.select("#need_time")
              .text(data.need_time);
          tooltip.select("#priority")
              .text(data.priority);
          tooltip.select("#state")
              .text(function () {
                let state = data.state;
                if(state===0){
                  return '后备队列 ';
                }else if(state===1){
                  return '就绪队列 ';
                }else if(state===2){
                  return '处于处理机A ';
                }else if(state===3){
                  return '处于处理机B ';
                }else if(state===4){
                  return '挂起队列 ';
                }
              });
          if(data.property==="0"){
            d3.selectAll(".f_b")
                .classed("hidden",true);
          }else{
            d3.selectAll(".f_b")
                .classed("hidden",false);
            d3.select("#fore")
                .text(function () {
                  return data.fore_name.join(",");
                });
            d3.select("#back")
                .text(function () {
                  return data.back_name.join(",");
                })
          }
          tooltip.select("#start")
              .text(function () {
                if(data.state === 1 || data.state===2 || data.state===3){
                  console.log(data)
                  d3.select("#start_text").classed("hidden",false);
                  return data.MLT.start;
                }
                else{
                  d3.select("#start_text").classed("hidden",true);
                }
              })
          tooltip.select("#size")
              .text(data.MLT.size);
        })
            .on("mouseout",function () {
              d3.select("#tooltip")
                  .classed("hidden",true);
            })
      }
    })
