+(function(w){
    w.wzhx = {};
    w.wzhx.css = function(node, type, val) {
        if (typeof node === "object" && typeof node["transform"] === "undefined") {
            node["transform"] = {};
        }

        if(arguments.length >= 3) {
            // 设置
            var text = "";
            node["transform"][type] = val;

            for(item in node["transform"]) {
                if(node["transform"].hasOwnProperty(item)) {
                    switch(item) {
                        case "translateX":
                        case "translateY":
                            text += item+"("+node["transform"][item]+"px)";
                            break;
                        case "scale":
                            text += item+"("+node["transform"][item]+")";
                            break;
                        case "rotate":
                            text += item+"("+node["transform"][item]+"deg)";
                            break;
                    }
                }
            }
            node.style.transform = node.style.webkitTransform = text;
        }else if(arguments.length === 2) {
            // 读取
            val = node["transform"][type];
            if(typeof val === "undefined"){
                switch(type) {
                    case "translateX":
                    case "translateY":
                    case "rotate":
                        val = 0;
                        break;
                    case "scale":
                        val = 1;
                        break;
                }
            }
            return val;
        }
    };

    w.wzhx.carousel = function carousel(arr) {
        // 生成轮播图HTML骨架
        var carouselWrap = document.querySelector(".carousel-wrap");
        if(carouselWrap) {

            var pointsLength = arr.length;
            // 无缝
            var needCarousel = carouselWrap.getAttribute("needCarousel");
            needCarousel = needCarousel == null?false:true;
            if(needCarousel){
                arr = arr.concat(arr);
            }

            var ulNode = document.createElement("ul");
            var styleNode = document.createElement("style");
            var pointsWrapNode = document.createElement("div");
            ulNode.classList.add("list");
            for(var i = 0; i < arr.length; i++) {
                ulNode.innerHTML += '<li><a href="javascript:;"><img src="' + arr[i] + '" alt="img' + i + '"></a></li>';
            }
            styleNode.innerHTML = ".carousel-wrap > .list {width: " + arr.length + "00%;} .carousel-wrap > .list > li {width: " + 1/arr.length*100 + "%;}";
            pointsWrapNode.classList.add("points-wrap");
            for (var i = 0; i < pointsLength; i++) {
                if(i == 0) {
                    pointsWrapNode.innerHTML += '<span class="active"></span>';
                } else {
                    pointsWrapNode.innerHTML += '<span></span>';
                }
            }
            carouselWrap.appendChild(ulNode);
            document.head.appendChild(styleNode);
            carouselWrap.appendChild(pointsWrapNode);

            var pointsSpan = document.querySelectorAll(".carousel-wrap > .points-wrap > span");
            
            // 因为ulNode开启了position:absolute,所以需要给容器设置高度(当前使用transform，没有定位)
            // var imgNodes = document.querySelector(".carousel-wrap > .list > li > a > img");
            // setTimeout(function() {
            // 	carouselWrap.style.height = imgNodes.offsetHeight+"px";
            // },100);

            // 滑屏
            // 	1、拿到元素一开始的位置
            // 	2、拿到手指一开始点击的位置
            // 	3、拿到手指move的实时距离
            // 	4、将手指移动的距离加给元素

            // 手指一开始的位置
            var startX = 0;
            // 元素一开始的位置
            var elementX = 0;
            // 元素移动后的位置 
            var translateX = 0;
            // 图片的索引
            var index = 0;
            carouselWrap.addEventListener("touchstart", function(ev) {
                ev = ev || event;
                // console.log(ev.changedTouches); 里面存放每根手指操作屏幕的信息
                var TouchC = ev.changedTouches[0];
                ulNode.style.transition = "none";

                // 无缝
                // 点击第一组的第一张时， 瞬间跳到第二组的第一张
                // 点击第二组的最后一张时， 瞬间跳到第一组的最后一张
                if(needCarousel) {
                    index = wzhx.css(ulNode, "translateX")/document.documentElement.clientWidth;
                    if(-index === 0) {
                        index = -pointsLength;
                    } else if (-index === (arr.length-1)) {
                        index = -(pointsLength-1);
                    }
                    wzhx.css(ulNode, "translateX", index*document.documentElement.clientWidth);
                }
                startX = TouchC.clientX;
                // elementX = ulNode.offsetLeft;
                // elementX = translateX;
                elementX = wzhx.css(ulNode, "translateX");

                // 清除定时器
                clearInterval(timer);
            }, {passive: true});
            carouselWrap.addEventListener("touchmove", function(ev) {
                ev = ev || event;
                var TouchC = ev.changedTouches[0];
                var nowX = TouchC.clientX;
                var disX = nowX - startX;
                wzhx.css(ulNode, "translateX", elementX+disX);
            }, {passive: true});
            carouselWrap.addEventListener("touchend", function(ev){
                ev = ev || event;
                // index抽象了ul的实时位置
                index = wzhx.css(ulNode, "translateX")/document.documentElement.clientWidth;
                index = Math.round(index);

                // 超出控制
                // console.log(index);
                if(index > 0) {
                    index = 0;
                } else if (index < 1-arr.length) {
                    index = 1-arr.length;
                }

                // 点按钮高亮
                Indicator(index);

                ulNode.style.transition = ".5s transform";
                wzhx.css(ulNode, "translateX", index*(document.documentElement.clientWidth));

                // 开启自动轮播
                if(needAuto) {
                    autoplay();
                }
            }, {passive: true});

            // 自动轮播
            var timer = 0;
            var needAuto = carouselWrap.getAttribute("needAuto");
            needAuto = needAuto == null?false:true;
            if(needAuto) {
                autoplay();
            }
            function autoplay() {
                clearInterval(timer);
                timer = setInterval(function() {
                    if(index == 1-arr.length) {
                        ulNode.style.transition="none";
                        index = 1-arr.length/2;
                        wzhx.css(ulNode, "translateX", index*document.documentElement.clientWidth);
                    }
                    setTimeout(function() {
                        index--;
                        ulNode.style.transition = "1s transform";
                        Indicator(index);
                        wzhx.css(ulNode, "translateX", index*document.documentElement.clientWidth);
                    },50);
                }, 2000);
            }

            function Indicator(index) {
                if (!pointsWrapNode) {
                    return;
                }
                for(var i = 0; i < pointsLength; i++) {
                    pointsSpan[i].classList.remove("active");
                }
                pointsSpan[-index%pointsLength].classList.add("active");
            }
        }
    };
})(window);