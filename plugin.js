//v 0.0.5
//2018/3/28
//2018暑期第二课
//更新helloPonics按钮绑定

var heUtil = (function () {
  /**
   * 播放下一帧不（循环播放）
   */
  function playFrame() {
    this.gotoAndStop(++this.currentFrame)
  }

  /**
   * 为当前元件可控元素绑定事件
   * @param preName        元素名称(不带序号)
   * @param btnNumb        元素个数
   * @param scope          作用域
   * @param callback       事件回调
   * @param callbackScope  回调函数作用域
   * @param isOnce         时候执行一次自动移除
   */
  function bindBtnfn(preName, btnNumb, scope, callback, callbackScope, isOnce) {
    for (let i = 0; i < btnNumb; i++) {
      scope[preName + i].cursor = 'pointer';
      scope[preName + i].on('click', callback, callbackScope, isOnce)
    }
  }

  /**
   * 播放下一帧。（最后一帧停止）
   */
  function nextFrame() {
    let c = this.currentFrame;
    let t = this.totalFrames;
    c++;
    if (c != t) {
      this.gotoAndStop(c);
    }
  }


  /**
   * 绑定常用按钮事件
   * v0.0.4 更新reading模块 问题部分。命名规则为：
   * |   目标元件   |元件名    |功能描述   |
   * 红色Q按钮 ：qbtn ,独立按键，进播放自身按下动画，控制题干动画播放与答案绑定
   * 题干：qt,播放自身出现的动画，答完题后绑定点击事件。使自身回到第一帧
   * 正确答案按钮 :qa0 ，透明点击区域（alpha=1%） ,点击后出现对号并且出特效。使qt响应点击回到第一帧
   * 其他答案按钮 :qa1 ,qa2 ,点击出现错误声音
   * 对号图标：qdh
   * 特效图标：qtx
   * 使用方法：运行时改变函数作用域call ，
   * heUtil.bindFn.call(this);
   */
  function bindFn() {

    var resetState = () => {
      this.qdh.visible = 0;
      this.qtx.visible = 0;
      let i = 0;
      while (this['qa' + i]) {
        this['qa' + i].visible = 0;
        this['qa' + i].on('click', checkAnswer, this)
        i++;
      }
    }

    function checkAnswer(e) {
      if (e.currentTarget.name == 'qa0') {
        playSound('oooy')
        this.qdh.visible = !0;
        this.qtx.visible = !0;
        this.qtx.gotoAndPlay(0)
        this.qt.on('click', () => {
          this.qt.play()
          resetState()
        }, null, true)
      } else {
        playSound('ooon');
      }
    }


    if (this.qbtn) {
      resetState();
      this.qbtn.cursor = 'pointer';
      this.qbtn.on('click', () => {
        this.qbtn.play();
        this.qt.gotoAndPlay(1)
        let i = 0;
        while (this['qa' + i]) {
          this['qa' + i].visible = 1;
          i++;
        }
      })
      //阻止点击穿透
      this.qt.on('click', () => {
      })
    }


    let btnAry0 = ['stBtn', 'tg'];
    btnAry0.forEach((item) => {
      if (this[item]) {
        this[item].cursor = 'pointer';
        this[item].on('click', playFrame);
        this[item].on('click', function () {
          this.parent.addChild(this)
        })
      }
    });

    let btnAry1 = ['ee', 'mc'];
    btnAry1.forEach((item) => {
      if (this[item]) {
        this[item].cursor = 'pointer';
        this[item].on('click', nextFrame)
      }
    });
  }

  /**
   * 内部函数 计算两个对象距离
   * @param a
   * @param b
   * @param match  匹配的最小距离
   * @returns {boolean}
   */
  function countDistance(a, b, match) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)) < match ? true : false
  }


  /**
   * 包围盒匹配碰撞
   * @param box {object}   盒子
   * @param item {object}  拖拽对象
   * @param mode {boolean} 是否严格匹配边界
   * @returns {boolean}
   */
  function matchBox(box, item, mode) {

    return true
  }

  /**
   * 绑定拖拽事件
   * @param dragBtnPreName  拖拽按钮名前缀
   * @param DropCallBack    释放拖拽回调
   * @param scope           回调函数作用域
   * @param matchArea       匹配区域
   * @param matchPreName    匹配区域名前缀
   */
  function bindDragFn(dragBtnPreName, DropCallBack, scope, matchArea, matchPreName) {
    let i = 0
    let btnTemp;
    let evtM
    let evtO
    let evtB
    let pnt = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0
    }

    function handleMouseDown(e) {

      btnTemp = e.currentTarget;
      pnt.x = btnTemp.x;
      pnt.y = btnTemp.y;
      pnt.dx = e.stageX - btnTemp.x;
      pnt.dy = e.stageY - btnTemp.y;
      btnTemp.scaleX = btnTemp.oScaleX;
      btnTemp.scaleY = btnTemp.oScaleY;
      btnTemp.parent.addChild(btnTemp)
      btnTemp['evtM'] = btnTemp.on('pressmove', handleMouseMove);
      btnTemp['evtU'] = btnTemp.on('pressup', DropCallBack)
    }


    function handleMouseMove(e) {
      btnTemp.x = e.stageX - pnt.dx;
      btnTemp.y = e.stageY - pnt.dy;

    }

    do {
      btnTemp = scope[dragBtnPreName + i];
      if (btnTemp) {
        btnTemp.cursor = 'pointer';
        btnTemp.ox = btnTemp.x;  //保存原始坐标值
        btnTemp.oy = btnTemp.y;
        btnTemp.oScaleX = btnTemp.scaleX; //保存原始缩放值
        btnTemp.oScaleY = btnTemp.scaleY;
        btnTemp.on('mousedown', handleMouseDown)
      }
      i++
    } while (scope[dragBtnPreName + i])

    if (matchArea) {
      i = 0;
      do {
        btnTemp = scope[matchPreName + i];
        if (btnTemp) {
          btnTemp.cursor = 'pointer';
          btnTemp.ox = btnTemp.x;
          btnTemp.oy = btnTemp.y;
          btnTemp.oScaleX = btnTemp.scaleX;
          btnTemp.oScaleY = btnTemp.scaleY;
          btnTemp.on('mousedown', handleMouseDown)
        }
        i++
      } while (scope[matchPreName + i])
    }


  }


  let HelloVocabulary = (function () {
    /**
     * Vocabulary 模块 模糊函数
     * @param btnNumb
     * @param scope
     */
    function blurBoard(btnNumb, scope) {

      bindBtnfn('btn', 9, scope, function () {
        var _this = this;
        createjs.Tween.get(this.filters[0], {
          onChange() {
            _this.updateCache();
          }
        }).to({blurX: 0, blurY: 0}, 500)
        scope.hua.x = this.x;
        scope.hua.y = this.y;
        scope.hua.gotoAndPlay(1);
        playSound('dd')
      }, null, true)
    }

    return {blurBoard}
  })();


  let HelloPhonics = (function () {
    //phonics
    function ph(scope) {
      if (typeof scope === 'undefined') {
        if (!this['btn']) {
          throw 'missing scope'
        } else {
          scope = this
        }
      }
      let channel = null;
      let i = 0;
      while (scope['btn' + i]) {
        scope['btn' + i].cursor = 'pointer';
        scope['btn' + i].on('click', function () {
          this.gotoAndStop(1);
          if (channel) channel.stop();
          channel = playSound('v' + this.name.substr(3, 1));
          channel.on('complete', () => channel = null)
        });
        i++;
      }
      scope['btn'].on('click', () => scope.pencil.play());
    }

    /**
     *
     * @param btnNumb 按钮对
     * @param answerIndex
     * @param scope
     */
    function se(btnNumb, answerIndex, scope) {
      if (typeof scope !== "object") throw '第三个参数必须为当前执行作用域';
      if (!(answerIndex instanceof Array)) throw '第二个参数必须为答案序列组成的数组';

      var _this = scope;
      for (let i = 0; i < btnNumb; i++) {
        for (let j = 0; j < 2; j++) {
          _this['btn' + i + j].cursor = 'pointer';
          _this['btn' + i + j].on('click', handleClick)
        }
      }

      function handleClick() {
        var b = this
        var ss0 = b.name.substr(3, 1); // 所在行
        var ss1 = b.name.substr(4, 1); // 所在列
        if (ss1 == answerIndex[ss0]) {
          playSound('oooy');
          if (c.gotoAndPlay) {
            c.gotoAndPlay(0)
          }
        } else {
          playSound('ooon')
        }
      }
    };
    return { ph, se}
  })
  ();

  return {
    HelloVocabulary,
    HelloPhonics,
    nextFrame,
    playFrame,
    bindFn,
    bindBtnfn,
    bindDragFn,
    countDistance
  }
})
();