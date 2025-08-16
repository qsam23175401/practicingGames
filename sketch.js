let myp5; // 用來存放 p5 實例

const sketch = (p) => {
  class Button {
    constructor(x, y, w, h, label, callback) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.label = label;
      this.callback = callback;
      this.visible = true;
    }

    display(R, G, B, F) {
      if (!this.visible) return;
      p.fill(R, G, B, F);
      p.stroke(255);
      p.strokeWeight(1);
      p.rect(this.x, this.y, this.w, this.h, 20);

      p.fill(0);
      p.noStroke();
      p.textSize(14);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    }

    isClicked(mx, my) {
      return (
        mx > this.x &&
        mx < this.x + this.w &&
        my > this.y &&
        my < this.y + this.h
      );
    }

    handleClick(mx, my) {
      if (this.isClicked(mx, my)) {
        this.callback();
      }
    }
  }

  let isPlayer1First = true;
  let 流程 = 0;
  let 藏起來 = [];
  let 比賽牌 = [];
  let myText = "請A玩家將左手邊的一張牌藏起來!";
  let myLog;
  let score1 = 0;
  let score2 = 0;
  let canvasWidth = 500;
  let canvasH = 450;

  let stone1, scissors1, paper1, stone2, scissors2, paper2, clearButton;

  p.setup = function () {
    let canvasW = p.windowWidth * 0.9;
    canvasWidth = canvasW;
    let cnv = p.createCanvas(canvasW, canvasH);
    cnv.parent("gameCanvas");

    stone1 = new Button(10, 100, canvasW * 0.22, 60, "石頭!", Cstone1);
    scissors1 = new Button(10, 170, canvasW * 0.22, 60, "剪刀!", Cscissors1);
    paper1 = new Button(10, 240, canvasW * 0.22, 60, "布!", Cpaper1);

    stone2 = new Button(canvasW * 0.7, 100, canvasW * 0.22, 60, "石頭!", Cstone2);
    scissors2 = new Button(canvasW * 0.7, 170, canvasW * 0.22, 60, "剪刀!", Cscissors2);
    paper2 = new Button(canvasW * 0.7, 240, canvasW * 0.22, 60, "布!", Cpaper2);

    clearButton = new Button(canvasW * 0.6, 10, canvasW * 0.18, 40, "重置桌面!", checkClear);

    p.background(100);
    myLog = p.createGraphics(canvasW, 100);
    myLog.background(180);
    myLog.fill(100, 20, 40);
    myLog.textSize(22);
    myLog.textAlign(p.LEFT, p.TOP);
    myLog.text(myText, 5, 5);
    p.image(myLog, 0, canvasH - myLog.height);

    p.noLoop();
  };

  p.draw = function () {
    p.background(100);
    stone1.display(120, 125, 45, 230);
    scissors1.display(120, 225, 45, 230);
    paper1.display(220, 125, 45, 230);
    stone2.display(120, 125, 45, 230);
    scissors2.display(120, 225, 45, 230);
    paper2.display(220, 125, 45, 230);
    clearButton.display(220, 125, 45, 230);

    myLog.background(180);
    myLog.text(myText, 5, 5);
    p.image(myLog, 0, canvasH - myLog.height);

    p.fill("yellow");
    let Tscore = "A玩家: " + score1 + "\nB玩家: " + score2;
    p.text(Tscore, canvasWidth * 0.9, canvasH * 0.95);
  };

  p.mouseClicked = function () {
    if (流程 == 0) {
      stone1.handleClick(p.mouseX, p.mouseY);
      scissors1.handleClick(p.mouseX, p.mouseY);
      paper1.handleClick(p.mouseX, p.mouseY);
    } else if (流程 == 1 || 流程 == 2) {
      stone2.handleClick(p.mouseX, p.mouseY);
      scissors2.handleClick(p.mouseX, p.mouseY);
      paper2.handleClick(p.mouseX, p.mouseY);
    } else if (流程 == 3) {
      stone1.handleClick(p.mouseX, p.mouseY);
      scissors1.handleClick(p.mouseX, p.mouseY);
      paper1.handleClick(p.mouseX, p.mouseY);
    }
    clearButton.handleClick(p.mouseX, p.mouseY);
    p.redraw();
  };

  // ---- 以下函式都保持邏輯，只把 p5 全域呼叫改成 p. ----
  function process0() {
    流程++;
    myText = isPlayer1First
      ? "請B玩家將右手邊的一張牌藏起來!"
      : "請A玩家將右手邊的一張牌藏起來!";
  }

  function process1() {
    流程++;
    scissors1.visible = false;
    stone1.visible = false;
    paper1.visible = false;
    myText = isPlayer1First ? "請A玩家選一張牌!" : "請B玩家選一張牌";
  }

  function process2() {
    scissors2.visible = false;
    stone2.visible = false;
    paper2.visible = false;
    stone1.visible = true;
    scissors1.visible = true;
    paper1.visible = true;
    藏起來[0].visible = false;
    myText = isPlayer1First ? "請B玩家選一張牌!" : "請A玩家選一張牌";
    流程++;
  }

  function process3() {
    stone1.visible = false;
    scissors1.visible = false;
    paper1.visible = false;

    比賽牌[0].visible = true;
    比賽牌[1].visible = true;

    let p1 = isPlayer1First ? 比賽牌[0].label : 比賽牌[1].label;
    let p2 = isPlayer1First ? 比賽牌[1].label : 比賽牌[0].label;

    if (p1 === p2) {
      myText = "平手！";
    } else if (
      (p1 === "石頭!" && p2 === "剪刀!") ||
      (p1 === "剪刀!" && p2 === "布!") ||
      (p1 === "布!" && p2 === "石頭!")
    ) {
      score1++;
      myText = "A玩家獲勝！";
    } else {
      score2++;
      myText = "B玩家獲勝！";
    }

    流程 = 4;
  }

  function Cstone1() {
    if (流程 == 0) {
      stone1.visible = false;
      藏起來.push(stone1);
      process0();
    } else if (流程 == 3 && 藏起來[0] != stone1) {
      比賽牌.push(stone1);
      process3();
    }
    p.redraw();
  }

  function Cscissors1() {
    if (流程 == 0) {
      scissors1.visible = false;
      藏起來.push(scissors1);
      process0();
    } else if (流程 == 3 && 藏起來[0] != scissors1) {
      比賽牌.push(scissors1);
      process3();
    }
    p.redraw();
  }

  function Cpaper1() {
    if (流程 == 0) {
      paper1.visible = false;
      藏起來.push(paper1);
      process0();
    } else if (流程 == 3 && 藏起來[0] != paper1) {
      比賽牌.push(paper1);
      process3();
    }
    p.redraw();
  }

  function Cstone2() {
    if (流程 == 1) {
      stone2.visible = false;
      藏起來.push(stone2);
      process1();
    } else if (流程 == 2 && 藏起來[1] != stone2) {
      比賽牌.push(stone2);
      process2();
    }
    p.redraw();
  }

  function Cscissors2() {
    if (流程 == 1) {
      scissors2.visible = false;
      藏起來.push(scissors2);
      process1();
    } else if (流程 == 2 && 藏起來[1] != scissors2) {
      比賽牌.push(scissors2);
      process2();
    }
    p.redraw();
  }

  function Cpaper2() {
    if (流程 == 1) {
      paper2.visible = false;
      藏起來.push(paper2);
      process1();
    } else if (流程 == 2 && 藏起來[1] != paper2) {
      比賽牌.push(paper2);
      process2();
    }
    p.redraw();
  }

  function checkClear() {
    流程 = 0;
    藏起來 = [];
    比賽牌 = [];
    myText = isPlayer1First
      ? "請B玩家將左手邊的一張牌藏起來!"
      : "請A玩家將左手邊的一張牌藏起來!";
    isPlayer1First = !isPlayer1First;
    stone1.visible = true;
    stone2.visible = true;
    scissors1.visible = true;
    scissors2.visible = true;
    paper1.visible = true;
    paper2.visible = true;
    p.clear();
    p.background(100);
    if (p.abs(score1 - score2) >= 3) {
      score1 = 0;
      score2 = 0;
    }
    p.redraw();
  }
};
