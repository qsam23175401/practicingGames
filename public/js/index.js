//包裝按鈕功能
class GameButton {
    constructor(domElement) {
        this.domElement = domElement;
        this.isLocked = false;
        this.gameFrameCmd = null;
    }
    lock() {
        this.isLocked = true;
    }
    unlock() {
        this.isLocked = false;
    }
    startGameFrameCmd(commands) {
        gameFrameFunctions.innerHTML = "";
        gameFrameFunctions.style.display = "none";
        if (commands.length > 0) {
            gameFrameFunctions.style.display = "flex";
            commands.forEach(cmd => cmd());
        }
    }
}

//入口按鈕
const toggleNavBtn = document.getElementById("toggleNavBtn");
//遊戲按鈕
const fisrtBtn = new GameButton(document.querySelector("#fisrtBtn"))
fisrtBtn.gameFrameCmd = [];
const puzzleGameBtn = new GameButton(document.querySelector("#puzzleGame"))
puzzleGameBtn.gameFrameCmd = [setFullscreenBtn];
const testGameBtn = new GameButton(document.getElementById("test"));
testGameBtn.gameFrameCmd = [setFullscreenBtn, setRPGSaveBtn];

//gameFrame、上下文字及功能區
const gameFrameText = document.getElementById("iframeUpperText");
const gameFrameFunctions = document.getElementById("additionFunction");
const gameFrame = document.getElementById("gameFrame");
let fullscreenPart = document.getElementById("gameFrame");

//入口用函數
function toggleNav() {
    const leftsideArea = document.getElementById("leftsideArea");
    if (leftsideArea.style.display === "none") {
        leftsideArea.style.display = "flex"; // 恢復
    } else {
        leftsideArea.style.display = "none";  // 隱藏
    }
}

function loadGame(url) {
    gameFrame.src = url;
}


//gameFrame功能相關
function setgameFrameText(textTOShow) {
    gameFrameText.textContent = textTOShow;
    gameFrameText.style.display = "flex";
    setInterval(() => {
        gameFrameText.style.display = "none";
    }, 5000);
}

function BtnHTMLTag(id, textContent) {
    if (typeof id === "string" && typeof textContent === "string") {
        return `<button type="button" id="${id}">${textContent}</button>`
    } else { throw new Error("button id,textContent必須為字串") }
}

function setFullscreenBtn() {
    if (!document.getElementById("fullscreenBtn")) {
        gameFrameFunctions.insertAdjacentHTML("beforeend", BtnHTMLTag("fullscreenBtn", "開啟全螢幕"))
        document.getElementById("fullscreenBtn").addEventListener("click", () => {
            fullscreenPart.requestFullscreen();
        })
    }
    fullscreenPart.requestFullscreen();
}

function setRPGSaveBtn() {
    //尚未設定時間限制
    if (!document.getElementById("RPGSaveBtn")) {
        gameFrameFunctions.insertAdjacentHTML("beforeend", BtnHTMLTag("RPGSaveBtn", "上傳存檔"))
        document.getElementById("RPGSaveBtn").addEventListener("click", () => {
            switch (gameFrame.name) {
                case "runstory":
                    //準備實作與資料庫連結
                    if (!!window.user.id) {

                    } else {
                        console.log("尚未登入")
                    }
                    break;
                case "test":
                    break;
            }
        })
    }
}



//入口按鈕功能實作
toggleNavBtn.addEventListener("click", toggleNav)

fisrtBtn.domElement.addEventListener("click", () => {
    loadGame('intro.html');
    gameFrame.name = "intro"
    fisrtBtn.startGameFrameCmd(fisrtBtn.gameFrameCmd);
})

puzzleGameBtn.domElement.addEventListener("click", () => {
    loadGame('puzzleGame/puzzleGame.html');
    toggleNav();
    gameFrame.name = "puzzleGame"
    puzzleGameBtn.startGameFrameCmd(puzzleGameBtn.gameFrameCmd);
})

testGameBtn.domElement.addEventListener("click", () => {
    if (!testGameBtn.isLocked) {
        toggleNav();
        //設定特殊按鈕們
        testGameBtn.startGameFrameCmd(testGameBtn.gameFrameCmd);

        loadGame('runstory/runstory.html');
        gameFrame.name = "runstory"
        testGameBtn.lock();
    } else {
        testGameBtn.unlock();
        setgameFrameText("請再按一次更新遊戲");
    }
})