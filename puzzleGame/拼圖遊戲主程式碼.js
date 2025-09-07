//宣告初始化變數
let NumOfPics = 5;//目前5張拼圖
let picIndex = 0; //從零開始
let started = false;
let picSize = [];//picSize[picIndex][0]=width
let piecePos = [];//piecePos[0]="0" 零號拼圖
let initialized = false;

//宣告系統文件
const playArea = document.getElementById("playArea")
const playAreaWidth = document.getElementById("playAreaWidth")
const difficultyText = document.getElementById("difficultyText")
const difficultyBtn = document.getElementById("difficulty")
const systemText = document.getElementById("systemText");
const hintBtn = document.getElementById("hintBtn");
const shiftBtn = document.getElementById("shiftBtn");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
let canvasBgd = document.getElementById("playBgd")//ID才是唯一.className會抓陣列
let ctx = canvasBgd.getContext("2d");

//難度字典
var difficulty = {
    lv: {
        value: 1,
        px: function (i) {
            return difficulty[("lv" + i)]["px"]
        },
        py: function (i) {
            return difficulty[("lv" + i)]["py"]
        },
        text: function (i) {
            return difficulty[("lv" + i)]["text"]
        },
    },
    "lv1": {
        "text": "目前難度：3*3",
        "px": 3,
        "py": 3,
    },
    "lv2": {
        "text": "目前難度：4*4",
        "px": 4,
        "py": 4,
    },
    "lv3": {
        "text": "目前難度：5*4",
        "px": 5,
        "py": 4,
    },
    "lv4": {
        "text": "目前難度：6*5",
        "px": 6,
        "py": 5,
    },
    "lv5": {
        "text": "目前難度：8*6",
        "px": 8,
        "py": 6,
    },
    "lv6": {
        "text": "目前難度：10*8",
        "px": 10,
        "py": 8,
    },
    width: 400,
    height: 320,
    pWidth: function (px) {
        return (this.width / px);
    },
    pHeight: function (py) {
        return (this.height / py);
    },
};
//總片數
let pxpy = difficulty.lv.px(difficulty.lv.value) * difficulty.lv.py(difficulty.lv.value);

//功能函數
function sysText(str, timeOrNot = true) {
    systemText.textContent = String(str);
    if (timeOrNot) {
        setTimeout(() => {
            systemText.textContent = "";
        }, 3000);
    }
}

function targetPic(n) {
    let picn = "pic" + n;
    return document.getElementById(picn);
}

function showPic(i) {
    targetPic(i).style.opacity = 1;
}

function cutPic(i) {
    targetPic(i).style.opacity = 0;
}

//初始化
function setDifficulty(i) {
    difficulty.lv.value = i;
    difficultyText.textContent = difficulty.lv.text(i);
}

function setWandH(width = 400, height = 320) {
    difficulty.width = width;
    difficulty.height = height;
}

function imgSize(targetPic, i) {
    let size = []
    return new Promise((resolve, reject) => {
        if (targetPic.complete) {
            // 如果圖片已經載入完成
            size[0] = targetPic.width;
            size[1] = targetPic.height;
            picSize[i] = size;
            resolve();
        } else {
            // 等待圖片載入完成
            targetPic.onload = () => {
                size[0] = targetPic.width;
                size[1] = targetPic.height;
                picSize[i] = size;
                resolve();
            };
            targetPic.onerror = () => reject("圖片載入失敗: " + targetPic.src);
        }
    })
}

function justfyPic(i) {
    targetPic(i).width = difficulty.width;
    targetPic(i).height = difficulty.height;
}

async function initialize() {
    setDifficulty(1);
    sysText("圖片載入中，請稍後", false)
    for (let i = 0; i < NumOfPics; i++) {
        await imgSize(targetPic(i), i); //疑似圖片量多，要好好等存完再調整大小
        justfyPic(i); //修改大小後就拿不到原始的大小
    }
    showPic(picIndex);
    sysText("圖片載入完成")
    initialized = true;
}


//重設畫布
function create_myGame() {
    if (!myGame) {
        myGame = new p5(mygame)
    } else {
        myGame.remove();
        playArea.innerHTML = playArea.innerHTML + '\n' + `<canvas id="playBgd" class="playBgd"></canvas>`;
        canvasBgd = document.getElementById("playBgd")
        ctx = canvasBgd.getContext("2d")
        myGame = new p5(mygame)
    }
}

//開始按鈕
function shuffle(array, pxpy) {
    for (let i = pxpy - 1; i > 0; i--) {
        // 在 [0, i] 隨機挑一個 index
        let j = Math.floor(Math.random() * (i + 1));
        // 交換 array[i] 和 array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function init_piecePos() {
    for (let i = 0; i < pxpy; i++) {
        piecePos[i] = "" + i;
    }
}

//提示按鈕
function pictureHint(img) {
    if (window.getComputedStyle(img).opacity == 0) {
        img.style.opacity = 1;
        setTimeout(() => {
            img.style.opacity = 0;
        }, 1200);
    }
}


//切下編號si拼圖，放到di位置
function drawOne(index, si, di) {
    let px = difficulty.lv.px(difficulty.lv.value)
    let py = difficulty.lv.py(difficulty.lv.value)
    let img = targetPic(index);
    const sw = (picSize[index][0] / px)
    const sh = (picSize[index][1] / py)
    let sx1 = sw * Math.floor(si / py);
    let sy1 = sh * (si % py);
    let dx2 = difficulty.pWidth(px) * Math.floor(di / py);
    let dy2 = difficulty.pHeight(py) * (di % py);

    ctx.drawImage(
        img,
        sx1, sy1, sw, sh,
        dx2, dy2, difficulty.pWidth(px), difficulty.pHeight(py),
    )
}

function drawAll() {
    for (let i = 0; i < pxpy; i++) {
        drawOne(picIndex, i, parseInt(piecePos[i]))
    }
    myGame.drawWell();
}

function changeTwo(p1, p2) {
    let piece1 = piecePos.indexOf(("" + p1))
    let piece2 = piecePos.indexOf(("" + p2))

    piecePos[piece1] = "" + p2;
    piecePos[piece2] = "" + p1;
    drawAll();
}

//按鈕區程式碼

difficultyBtn.addEventListener("click", () => {
    if (!started) {
        setDifficulty((difficulty.lv.value % 6) + 1);
    } else {
        sysText("遊戲進行中無法切換")
    }
})

hintBtn.addEventListener("click", () => {
    pictureHint(targetPic(picIndex));
})

shiftBtn.addEventListener("click", () => {
    if (!initialized) {
        sysText("請稍等圖片載入", false)
    } else if (started) {
        sysText("遊戲進行中不能切換");
        return;
    } else {
        cutPic(picIndex);
        picIndex++;
        picIndex = picIndex % NumOfPics;
        showPic(picIndex);
    }
})

startBtn.addEventListener("click", () => {
    if (!initialized) {
        sysText("請稍等圖片載入", false)
    } else if (!started) {
        pxpy = difficulty.lv.px(difficulty.lv.value) * difficulty.lv.py(difficulty.lv.value);
        setWandH(playAreaWidth.value, playAreaWidth.value / 1.25);
        create_myGame();
        init_piecePos();

        playArea.style.width = String(difficulty.width) + "px";
        playArea.style.height = String(difficulty.height) + "px";
        for (let i = 0; i < NumOfPics; i++) {
            justfyPic(i);
        }

        started = true;
        //隱藏預覽
        cutPic(picIndex);
        sysText("遊戲開始");
        //切成小塊放進playArea
        piecePos = shuffle(piecePos, pxpy);
        drawAll();
    } else {
        sysText("已經開始了")
    }
})

resetBtn.addEventListener("click", () => {
    if (!initialized) {
        sysText("請稍等圖片載入", false)
    } else if (started) {
        started = false;
        showPic(picIndex);
        choosed = 0;
        sysText("重置拼圖，請再重選拼圖");
        init_piecePos();
        myGame.putPieces();
    }
});

initialize();