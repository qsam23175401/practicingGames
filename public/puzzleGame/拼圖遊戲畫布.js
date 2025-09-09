let myGame=null;

let choosed = 0;
let choosedIndex = [];

//p5物件，以 new p5(mygame)
function mygame(p) {

    let width = difficulty.width;
    let height = difficulty.height;
    let px = difficulty.lv.px(difficulty.lv.value);
    let py = difficulty.lv.py(difficulty.lv.value);
    let pw = width / px;
    let ph = height / py;

    p.setup = function () {
        let cnvs = p.createCanvas(width, height, playBgd);
        p.background(220, 250, 0);
        cnvs.parent("playArea")

        p.putPieces();

        p.noLoop();
    }
    p.draw = function () {

    }

    p.putPieces = function () {
        for (let i = 0; i < (px * py); i++) {
            piecePos[i] = "" + i;
        }
    }

    p.drawWell = function () {
        for (let i = 1; i < px; i++) {
            p.stroke('black');
            p.strokeWeight(1);
            //p.line(80 * i, 0, 80 * i, 320);
            p.line(pw * i, 0, pw * i, height);
        }
        for (let i = 1; i < py; i++) {
            p.stroke('black');
            p.strokeWeight(1);
            //p.line(0, 80 * i, 400, 80 * i);
            p.line(0, ph * i, width, ph * i);
        }
    }

    //記得類型是字串
    p.drawHL = function (index) {
        p.stroke('magenta');
        p.strokeWeight(3);
        p.fill(0, 0)
        let corner = [
            "0", String(py * (px - 1)), String(px * py - 1), String(py - 1)
        ];

        switch (index) {
            case corner[0]:
                p.rect(pw * Math.floor(index / py), ph * (index % py),
                    pw, ph,
                    12, 0, 0, 0)
                choosed++;
                break;
            case corner[3]:
                p.rect(pw * Math.floor(index / py), ph * (index % py),
                    pw, ph,
                    0, 0, 0, 12)
                choosed++;
                break;
            case corner[1]:
                p.rect(pw * Math.floor(index / py), ph * (index % py),
                    pw, ph,
                    0, 12, 0, 0)
                choosed++;
                break;
            case corner[2]:
                p.rect(pw * Math.floor(index / py), ph * (index % py),
                    pw, ph,
                    0, 0, 12, 0)
                choosed++;
                break;
            default:
                p.rect(pw * Math.floor(index / py), ph * (index % py),
                    pw, ph)
                choosed++;
                break;
        }
    }

    p.isRight = () => {
        let r = 0;
        for (let i = 0; i < (px * py); i++) {
            if (parseInt(piecePos[i]) == i) { r++ }
        }
        if (r == (px * py)) {
            sysText("恭喜完成!! 遊戲結束!!")
            started = false;
            showPic(picIndex);
            choosed = 0;
        }
    }

    p.isInCanvas = function () {
        return ((width > p.mouseX) && (p.mouseX > 0) && (height > p.mouseY) && (p.mouseY > 0));
    }

    p.mouseClicked = () => {
        if (choosed == 1 && started && p.isInCanvas()) {
            let index = 0
            index += (py * Math.floor(p.mouseX / pw));
            index += (Math.floor(p.mouseY / ph) % py);
            choosedIndex[1] = index;
            changeTwo(choosedIndex[0], choosedIndex[1])
            choosed = 0;
            p.isRight();
        } else if (choosed < 1 && started && p.isInCanvas()) {
            let index = 0
            index += (py * Math.floor(p.mouseX / pw));
            index += (Math.floor(p.mouseY / ph) % py);
            p.drawHL(String(index))
            choosedIndex[0] = index;
        }

    }

}

