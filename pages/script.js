class CSharpRandom {
    #inext;
    #inextp;
    #SeedArray = [];

    constructor(seed) {
        this.setSeed(seed);
    }

    setSeed(seed) {
        let ii;
        let mj;
        let mk;
        
        let subtraction = (seed == -2147483648) ? 2147483647 : Math.abs(seed);
        mj = 161803398 - subtraction;
        this.#SeedArray[55] = mj;
        mk = 1;
        for (let i = 1; i < 55; i++) {
            ii = Math.imul(21, i) % 55;
            this.#SeedArray[ii] = mk;
            mk = mj - mk;
            if (mk < 0) {
                mk += 2147483647;
            }
            mj = this.#SeedArray[ii];
        }
        for (let k = 1; k < 5; k++) {
            for (let i = 1; i < 56; i++) {
                this.#SeedArray[i] -= this.#SeedArray[1 + (i+30)%55];
                if (this.#SeedArray[i] < 0) {
                    this.#SeedArray[i] += 2147483647;
                }
            }
        }
        this.#inext = 0;
        this.#inextp = 21;
    }

    internalSample() {
        let retVal;
        let locINext = this.#inext;
        let locINextp = this.#inextp;
        
        if (++locINext >= 56) {
            locINext = 1;
        }
        if (++locINextp >= 56) {
            locINextp = 1;
        }

        retVal = this.#SeedArray[locINext] - this.#SeedArray[locINextp];
 
        if (retVal == 2147483647) {
            retVal--;
        }
        if (retVal < 0) {
            retVal += 2147483647;
        }

        this.#SeedArray[locINext] = retVal;

        this.#inext = locINext;
        this.#inextp = locINextp;

        return retVal;
    }
}

function shuffle(seed) {
    let rng = new CSharpRandom(seed);
    let indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    let values = [];
    for (let i = 0; i < 23; i++) {
        values[i] = rng.internalSample();
    }
    indices.sort((a, b) => {return (values[a] > values[b]) ? 1 : -1}); 
    return indices.slice(0, 9);
}

function text_to_numeric_seed(text) {
    text = String(text);
    let result = 0;
    for (let i = 0; i < text.length; i++) {
        result += text.charCodeAt(i);
        if (result > 0x100000000) {return 0}
    }
    return result;
}

function numeric_to_text_seed(number) {
    if (number > 0x100000000) {return "NUMBER TOO BIG"}
    let big = Math.floor(number / 0xFFFF);
    let small = number % 0xFFFF;
    return String.fromCharCode(0xFFFF).repeat(big) + String.fromCharCode(small);
}

function canvasArrow(context, start, end, r) {
    const fromx = start[0];
    const fromy = start[1];
    const tox = end[0];
    const toy = end[1];
    context.strokeStyle = 'black';
    context.fillStyle = 'black';
    context.lineWidth = r/2;
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.stroke();

    var x_center = tox;
    var y_center = toy;
    var angle;
    var x;
    var y;
    context.beginPath();
    angle = Math.atan2(toy-fromy,tox-fromx)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;
    context.moveTo(x, y);
    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;
    context.lineTo(x, y);
    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;
    context.lineTo(x, y);
    context.closePath();
    context.fill();
}

function drawArrows(context, seed) {
    const arrowsize = 10;
    const start_pos = [585, 242];
    const coords = [[163, 825], [252, 808], [236, 931], [406, 1005], [510, 728], [510, 1015], [171, 694], [212, 218], [242, 317], [159, 93], [407, 108], [461, 427], [220, 438], [952, 310], [1011, 310], [844, 92], [703, 327], [975, 181], [1119, 139], [1083, 658], [1083, 892], [1010, 966], [837, 979]];
    const indices = shuffle(seed);
    canvasArrow(context, start_pos, coords[indices[0]], arrowsize);
    for (let i = 0; i < 8; i++) {
        canvasArrow(context, coords[indices[i]], coords[indices[i+1]], arrowsize);
    }
}

function updateCanvas(seed=null) {
    if (!(imgready===true)) {console.log("Image not loaded"); return}
    const cnv = document.getElementById("routeCanvas");
    const ctx = cnv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    if (seed) {
        drawArrows(ctx, seed);
    }
}

function handleTextSeed() {
    const textinput = document.getElementById("textseed");
    const numinput = document.getElementById("numseed");
    const text = String(textinput.value);
    const numseed = text_to_numeric_seed(text);
    numinput.value = String(numseed);
    updateCanvas(numseed);
}

function handleNumericSeed() {
    const textinput = document.getElementById("textseed");
    const numinput = document.getElementById("numseed");
    const numseed = parseInt(numinput.value);
    if (numseed == NaN) {console.log("numseed not a number"); return}
    textinput.value = numeric_to_text_seed(numseed);
    updateCanvas(numseed);
}

const img = new Image();
var imgready = false;
img.addEventListener("load", () => {imgready = true; updateCanvas()});
img.src = "positions.png";

//rnd = new CSharpRandom(1337);
//console.log(rnd.internalSample());
//console.log(shuffle(1440008194));
//console.log(text_to_numeric_seed("￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿￿愚"));
//updateCanvas();
