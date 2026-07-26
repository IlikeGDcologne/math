const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
let functions = [];
let shadedRegion = null;
let riemannAnimation = null;
let animationFrame = null;

// Canvas size
function resizeCanvas(){

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    drawGraph();

}

window.addEventListener("resize", resizeCanvas);


// Camera settings
let scale = 50; // pixels per unit

let offsetX = 0;
let offsetY = 0;


// Mouse movement
let dragging = false;

let lastMouseX = 0;
let lastMouseY = 0;



canvas.addEventListener("mousedown", e=>{

    dragging = true;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

});



canvas.addEventListener("mouseup", ()=>{

    dragging=false;

});



canvas.addEventListener("mouseleave", ()=>{

    dragging=false;

});



canvas.addEventListener("mousemove", e=>{


    if(!dragging) return;


    let dx = e.clientX - lastMouseX;
    let dy = e.clientY - lastMouseY;


    offsetX += dx;
    offsetY += dy;


    lastMouseX = e.clientX;
    lastMouseY = e.clientY;


    drawGraph();

});



// Zoom
canvas.addEventListener("wheel", e=>{


    e.preventDefault();


    if(e.deltaY < 0){

        scale *= 1.1;

    }else{

        scale /= 1.1;

    }


    drawGraph();


});




// Draw everything
function drawGraph(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawGrid();
    drawAxes();

    if(shadedRegion){
        drawShadedRegion();
    }

    if(riemannAnimation){
        drawRiemann();
    }

    drawFunctions();

}



// Grid
function drawGrid(){


    ctx.beginPath();

    ctx.strokeStyle="#ddd";

    ctx.lineWidth=1;



    let startX = offsetX % scale;

    for(
        let x=startX;
        x<canvas.width;
        x+=scale
    ){

        ctx.moveTo(x,0);
        ctx.lineTo(x,canvas.height);

    }



    let startY = offsetY % scale;


    for(
        let y=startY;
        y<canvas.height;
        y+=scale
    ){

        ctx.moveTo(0,y);
        ctx.lineTo(canvas.width,y);

    }


    ctx.stroke();

}



// Axis
function drawAxes(){


    ctx.beginPath();

    ctx.strokeStyle="black";

    ctx.lineWidth=2;


    // X axis

    let xAxis = canvas.height/2 + offsetY;


    ctx.moveTo(0,xAxis);

    ctx.lineTo(
        canvas.width,
        xAxis
    );



    // Y axis

    let yAxis = canvas.width/2 + offsetX;


    ctx.moveTo(
        yAxis,
        0
    );

    ctx.lineTo(
        yAxis,
        canvas.height
    );


    ctx.stroke();

}



resizeCanvas();

function drawFunctions(){


    functions.forEach(func=>{


        ctx.beginPath();

        ctx.strokeStyle="red";

        ctx.lineWidth=3;



        let started=false;



        for(
            let pixel=0;
            pixel<canvas.width;
            pixel++
        ){


            let x =
            (pixel - canvas.width/2 - offsetX)
            / scale;



            let y;



            try{

                y = func(x);

            }

            catch{

                continue;

            }



            if(
                !isFinite(y)
            ){

                started=false;
                continue;

            }



            let screenY =
            canvas.height/2
            + offsetY
            - y*scale;



            if(!started){

                ctx.moveTo(
                    pixel,
                    screenY
                );

                started=true;

            }

            else{

                ctx.lineTo(
                    pixel,
                    screenY
                );

            }

        }


        ctx.stroke();


    });


}

function graphInput(){


    let input =
    document.getElementById("inputBox").value;


    let lines =
    input.split("\n");


    functions=[];


    lines.forEach(line=>{


        let func=parseFunction(line);


        if(func){

            functions.push(func);

        }


    });


    drawGraph();

}
function shadeIntegral(func, start, end){

    // Save the final shaded region
    shadedRegion = {
        func,
        start,
        end
    };

    // Start the animation
    riemannAnimation = {
        func,
        start,
        end,
        rectangles:5,
        maxRectangles:300
    };

    if(animationFrame){
        cancelAnimationFrame(animationFrame);
    }

    animateIntegral();

}

function drawShadedRegion(){

    const func = shadedRegion.func;
    const start = shadedRegion.start;
    const end = shadedRegion.end;

    ctx.beginPath();

    ctx.fillStyle = "rgba(0,150,255,0.25)";

    let first = true;

    for(let x = start; x <= end; x += 0.01){

        let y = func(x);

        if(!isFinite(y)) continue;

        let screenX =
            canvas.width/2 +
            offsetX +
            x*scale;

        let screenY =
            canvas.height/2 +
            offsetY -
            y*scale;

        if(first){

            ctx.moveTo(
                screenX,
                canvas.height/2 + offsetY
            );

            ctx.lineTo(
                screenX,
                screenY
            );

            first = false;

        }

        else{

            ctx.lineTo(
                screenX,
                screenY
            );

        }

    }

    ctx.lineTo(
        canvas.width/2 + offsetX + end*scale,
        canvas.height/2 + offsetY
    );

    ctx.closePath();

    ctx.fill();

}

function animateIntegral(){

    drawGraph();

    drawRiemann();

    if(
        riemannAnimation.rectangles <
        riemannAnimation.maxRectangles
    ){

        riemannAnimation.rectangles += 5;

        if(
            riemannAnimation.rectangles<
            riemannAnimation.maxRectangles
        ){

            animationFrame =
            requestAnimationFrame(
                animateIntegral
            );

        }

        else{

            riemannAnimation.rectangles =
            riemannAnimation.maxRectangles;

            riemannAnimation = null;

            drawGraph();

        }

    }

}

function drawRiemann(){

    if(!riemannAnimation) return;

    let{

        func,
        start,
        end,
        rectangles

    } = riemannAnimation;


    let dx =
    (end-start)/rectangles;


    ctx.fillStyle=
    "rgba(0,120,255,.35)";

    ctx.strokeStyle=
    "rgba(0,120,255,.8)";


    for(

        let i=0;

        i<rectangles;

        i++

    ){

        let x =
        start+i*dx;

        let y =
        func(x);


        let sx =
        canvas.width/2+
        offsetX+
        x*scale;

        let sy =
        canvas.height/2+
        offsetY-
        y*scale;


        let width =
        dx*scale;

        let height =
        y*scale;


        ctx.fillRect(

            sx,

            canvas.height/2+
            offsetY-height,

            width,

            height

        );


        ctx.strokeRect(

            sx,

            canvas.height/2+
            offsetY-height,

            width,

            height

        );

    }

}