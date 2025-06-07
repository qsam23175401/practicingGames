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
    fill(R, G, B, F);
    stroke(255);
    strokeWeight(1);
    rect(this.x, this.y, this.w, this.h, 20);

    fill(0);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  isClicked(mx, my) {
    return (
      mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h
    );
  }

  handleClick(mx, my) {
    if (this.isClicked(mx, my)) {
      this.callback();
    }
  }
}

let isPlayer1First = true; // 預設為 true（A玩家先攻）
let 流程 = 0;
let 藏起來 = [];
let 比賽牌 = [];
let myText = "請A玩家將左手邊的一張牌藏起來!";
let myLog;
let circleProdctor;
let score1 = 0;
let score2 = 0;
let canvasW = 500;
let canvasH = 450;
function setup() {
  canvasW = windowWidth * 0.9;
  console.log(canvasW,canvasH)
  createCanvas(canvasW, canvasH);
  stone1 = new Button(10, 100, canvasW * 0.22, 60, "石頭!", Cstone1);
  scissors1 = new Button(10, 170, canvasW * 0.22, 60, "剪刀!", Cscissors1);
  paper1 = new Button(10, 240, canvasW * 0.22, 60, "布!", Cpaper1);
  stone2 = new Button(canvasW *0.7, 100, canvasW * 0.22, 60, "石頭!", Cstone2);
  scissors2 = new Button(canvasW *0.7, 170, canvasW * 0.22, 60, "剪刀!", Cscissors2);
  paper2 = new Button(canvasW *0.7, 240, canvasW * 0.22, 60, "布!", Cpaper2);
  clearButton = new Button(
    canvasW * 0.6,
    10,
    canvasW * 0.18,
    40,
    "重置桌面!",
    checkClear
  );

  background(100);
  myLog = createGraphics(canvasW, 100);
  myLog.background(180);
  myLog.fill(100, 20, 40); // 設定文字顏色
  myLog.textSize(22); // 設定文字大小
  myLog.textAlign(LEFT, TOP); // 置中對齊
  myLog.text(myText, 5, 5); // 在中間顯示文字
  image(myLog, 0, canvasH - myLog.height);
  noLoop();
}

function draw() {
  background(100);
  stone1.display(120, 125, 45, 230);
  scissors1.display(120, 225, 45, 230);
  paper1.display(220, 125, 45, 230);
  stone2.display(120, 125, 45, 230);
  scissors2.display(120, 225, 45, 230);
  paper2.display(220, 125, 45, 230);
  clearButton.display(220, 125, 45, 230);
  myLog.background(180);
  myLog.text(myText, 5, 5);
  image(myLog, 0, canvasH - myLog.height);
  fill("yellow");
  let Tscore = "A玩家: " + score1 + "\nB玩家: " + score2;
  text(Tscore, canvasW *0.9, canvasH *0.95);
}

function mouseClicked() {
  if (流程 == 0) {
    stone1.handleClick(mouseX, mouseY);
    scissors1.handleClick(mouseX, mouseY);
    paper1.handleClick(mouseX, mouseY);
  } else if (流程 == 1 || 流程 == 2) {
    stone2.handleClick(mouseX, mouseY);
    scissors2.handleClick(mouseX, mouseY);
    paper2.handleClick(mouseX, mouseY);
  } else if (流程 == 3) {
    stone1.handleClick(mouseX, mouseY);
    scissors1.handleClick(mouseX, mouseY);
    paper1.handleClick(mouseX, mouseY);
  }
  clearButton.handleClick(mouseX, mouseY);
  redraw();
}

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

  比賽牌[0].visible = true; // 玩家選的牌
  比賽牌[1].visible = true; // 對手選的牌

  // 根據 label 判斷勝負
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
  redraw();
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
  redraw();
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
  redraw();
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
  redraw();
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
  redraw();
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
  redraw();
}

function checkClear() {
  流程 = 0;
  藏起來 = [];
  比賽牌 = [];
  myText = isPlayer1First
    ? "請B玩家將左手邊的一張牌藏起來!"
    : "請A玩家將左手邊的一張牌藏起來!";
  // 切換先攻方
  isPlayer1First = !isPlayer1First;
  stone1.visible = true;
  stone2.visible = true;
  scissors1.visible = true;
  scissors2.visible = true;
  paper1.visible = true;
  paper2.visible = true;
  clear();
  background(100);
  if (abs(score1 - score2) >= 3) {
    score1 = 0;
    score2 = 0;
  }
  redraw();
}
