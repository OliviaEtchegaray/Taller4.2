// ELEMENTOS

const cards = document.querySelectorAll(".card");
const overlay = document.getElementById("overlay");
const windowBox = document.getElementById("window");

const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext("2d");

let animation = null;
let currentSystem = 0;


// CUADRAODS

function drawGradientSquare(ctx, x, y, size, alpha = 1) {
    let gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 1.3);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`); 
    gradient.addColorStop(1, `rgba(88, 242, 244, ${alpha})`);  

    ctx.fillStyle = gradient;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

// CIRUCLOS
function drawGradientCircle(ctx, x, y, radius, r, g, b, alpha = 1) {
    let gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`); 
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha})`);  

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// TRIANGULOS 

function drawGradientTriangle(ctx, x, y, size, r, g, b, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    
    let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 1.2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`); 
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    
    ctx.beginPath();
    ctx.moveTo(0, -size / 1.5);
    ctx.lineTo(-size / 1.7, size / 1.7);
    ctx.lineTo(size / 1.7, size / 1.7);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
}

// FONDOS 


function drawGradientCircle(ctx, x, y, radius, alpha = 1) {
    let gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`); // Centro blanco
    gradient.addColorStop(1, `rgba(200, 160, 255, ${alpha})`);  // Borde Lila pastel

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// HELPER DE DISEÑO: Fondo radial dinámico
function drawRadialBackground(ctx, canvas, hexColor) {
    let gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0, 
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); 
    gradient.addColorStop(1, hexColor);                

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
} 


// CANVAS PRINCIPAL

function resizeMainCanvas(){
    mainCanvas.width = windowBox.clientWidth;
    mainCanvas.height = windowBox.clientHeight;
}

window.addEventListener("resize", resizeMainCanvas);
resizeMainCanvas();


// PREVIEWS

function resizePreview(canvas){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}


// ABRIR SISTEMAS

cards.forEach(card=>{
    if(card.classList.contains("disabled")) return;

    card.addEventListener("click",()=>{
        currentSystem = Number(card.dataset.system);
        overlay.classList.add("active");
        resizeMainCanvas();
        stopCurrentAnimation();
        openSystem(currentSystem);
    });
});


// CERRAR OVERLAY

overlay.addEventListener("click",(e)=>{
    if(e.target!==overlay) return;

    overlay.classList.remove("active");
    stopCurrentAnimation();

    mainCtx.clearRect(
        0,
        0,
        mainCanvas.width,
        mainCanvas.height
    );
});




function stopCurrentAnimation(){
    if(animation){
        cancelAnimationFrame(animation);
        animation=null;
    }

    mainCanvas.onclick=null;
    mainCanvas.onmousemove=null;
    mainCanvas.onmousedown=null;
    mainCanvas.onmouseup=null;
    mainCanvas.onmouseleave=null;

   
    mainCanvas.ontouchstart=null;
    mainCanvas.ontouchmove=null;
    mainCanvas.ontouchend=null;
}


function openSystem(id){
    switch(id){
        case 1: startBlue1(); break;
        case 2: startBlue2(); break; // Función pendiente
        case 3: startBlue3(); break; // Función pendiente
        case 4: startCirculo1(); break;
        case 5: startCirculo2(); break;
        case 6: startCirculo3(); break;
        case 7: startTriangulo1(); break;
        case 8: startTriangulo2(); break;
        case 9: startTriangulo3(); break;
    }
}


// PREVIEW 1

const p1 = document.getElementById("preview1");
const c1 = p1.getContext("2d");
resizePreview(p1);

let x1=0;
let trail1=[];

function preview1(){
    resizePreview(p1);
    c1.clearRect(0,0,p1.width,p1.height);

    let cx = p1.width/2 + Math.sin(x1)*20; 
    let cy = p1.height/2;

    trail1.push({ x:cx, y:cy, a:1 });

    trail1.forEach(t => {
        drawGradientSquare(c1, t.x, t.y, 32, t.a);
        t.a -= 0.03;
    });

    trail1 = trail1.filter(t => t.a > 0);
    drawGradientSquare(c1, cx, cy, 32, 1);
    
    x1 += 0.03;
    requestAnimationFrame(preview1);
}
preview1();


// PREVIEW 2 
const p2=document.getElementById("preview2");
const c2=p2.getContext("2d");
resizePreview(p2);

let p2Time = 0;

function preview2(){
    resizePreview(p2);
    c2.clearRect(0,0,p2.width,p2.height);

    p2Time += 0.05;
   
    let offsetX = Math.sin(p2Time) * 12;
    let offsetY = Math.cos(p2Time * 1.5) * 8;

    drawGradientSquare(c2, p2.width/2 + offsetX, p2.height/2 + offsetY, 36, 1);
    requestAnimationFrame(preview2);
}
preview2();


// PREVIEW 3 
const p3=document.getElementById("preview3");
const c3=p3.getContext("2d");
resizePreview(p3);

let p3Square = { x: p3.width/2, y: p3.height/2, alpha: 1 };
let p3Trails = [];

function preview3(){
    resizePreview(p3);
    c3.clearRect(0,0,p3.width,p3.height);

    if (p3Square.alpha > 0) {
        p3Square.x += Math.sin(p3Square.alpha * 10) * 2;
        p3Square.y -= 1.5; 
        
        p3Trails.push({x: p3Square.x, y: p3Square.y, a: p3Square.alpha});
        p3Square.alpha -= 0.01; 
    } else if (p3Trails.length === 0) {
        p3Square = { x: p3.width/2, y: p3.height/2 + 20, alpha: 1 }; 
    }

    p3Trails.forEach(t => {
        drawGradientSquare(c3, t.x, t.y, 20, t.a);
        t.a -= 0.05;
    });
    p3Trails = p3Trails.filter(t => t.a > 0);

    if(p3Square.alpha > 0) {
        drawGradientSquare(c3, p3Square.x, p3Square.y, 20, p3Square.alpha);
    }
    requestAnimationFrame(preview3);
}
preview3();

// PREVIEW 4 (Círculo 1: Bolita amarilla subiendo y bajando)
const p4 = document.getElementById("preview4");
const c4 = p4.getContext("2d");
resizePreview(p4);
let p4Time = 0;

function preview4() {
    resizePreview(p4);
    c4.clearRect(0,0,p4.width,p4.height);
    p4Time += 0.05;

    let cx = p4.width / 2;
    let cy = p4.height / 2;

    // Círculo Izquierdo (Violeta lleno, el que rechaza)
    drawGradientCircle(c4, cx - 35, cy + 5, 28, 200, 160, 255, 1);
    c4.beginPath(); c4.arc(cx - 35, cy + 5, 28, 0, Math.PI*2); c4.strokeStyle="#333"; c4.stroke();

    // Círculo Derecho (Vacío, el que acepta)
    c4.beginPath(); c4.arc(cx + 35, cy - 25, 28, 0, Math.PI*2); c4.strokeStyle="#333"; c4.stroke();

    // Bolita Amarilla (moviéndose arriba y abajo)
    let moveY = Math.sin(p4Time * 2.5) * 6;
    drawGradientCircle(c4, cx + 35, cy + 30 + moveY, 10, 255, 235, 150, 1);

    requestAnimationFrame(preview4);
}
preview4();

// PREVIEW 5 
const p5 = document.getElementById("preview5");
const c5 = p5.getContext("2d");
resizePreview(p5);
let p5Time = 0;

function preview5(){
    resizePreview(p5);
    c5.clearRect(0,0,p5.width,p5.height);
    p5Time += 0.03;

    let cx1 = p5.width/2 - 30; // Círculo izquierdo
    let cx2 = p5.width/2 + 30; // Círculo derecho vacío
    let cy = p5.height/2;

    // Contenedores Lilas
    drawGradientCircle(c5, cx1, cy, 22, 200, 160, 255, 1);
    drawGradientCircle(c5, cx2, cy, 22, 200, 160, 255, 1);

    // Bolitas estáticas (se quedan en el de la izquierda)
    drawGradientCircle(c5, cx1 - 8, cy - 8, 7, 100, 200, 255, 1); // Celeste
    drawGradientCircle(c5, cx1 + 8, cy - 8, 7, 150, 230, 150, 1); // Verde

    // Bolitas animadas (tiran hacia la derecha)
    let pull = Math.abs(Math.sin(p5Time * 2)) * 30; // Tirón hacia adelante
    
    drawGradientCircle(c5, cx1 - 8 + pull, cy + 8, 7, 100, 200, 255, 1); // Celeste
    drawGradientCircle(c5, cx1 + 8 + pull, cy + 8, 7, 150, 230, 150, 1); // Verde

    requestAnimationFrame(preview5);
}
preview5();


// PREVIEW 6
const p6 = document.getElementById("preview6");
const c6 = p6.getContext("2d");
resizePreview(p6);
let p6Time = 0;

function preview6(){
    resizePreview(p6);
    c6.clearRect(0,0,p6.width,p6.height);
    p6Time += 0.05;

    let cy = p6.height/2 + Math.sin(p6Time) * 15; 

    drawGradientCircle(c6, p6.width/2 - 15, cy, 14, 200, 160, 255, 0.8);
    drawGradientCircle(c6, p6.width/2 + 15, cy, 14, 200, 160, 255, 0.8);

    requestAnimationFrame(preview6);
}
preview6();


// PREVIEW 7
const p7 = document.getElementById("preview7");
const c7 = p7.getContext("2d");
resizePreview(p7);
let p7Time = 0;

function preview7(){
    resizePreview(p7);
    c7.clearRect(0,0,p7.width,p7.height);
    p7Time += 0.05;

    let isShaking = (p7Time % 4) > 3; 
    let shakeX = isShaking ? (Math.random() - 0.5) * 10 : 0;
    let opacity = isShaking ? 1 : 0.3;

   
    drawGradientTriangle(c7, p7.width/2 + 10 + shakeX, p7.height/2, 28, 150, 255, 150, opacity);
    
    requestAnimationFrame(preview7);
}
preview7();


// PREVIEW 8 
const p8 = document.getElementById("preview8"); 
const c8 = p8.getContext("2d");
resizePreview(p8);
let p8Time = 0;

function preview8(){
    resizePreview(p8);
    c8.clearRect(0, 0, p8.width, p8.height);
    p8Time += 0.05;

    let wobbleX = Math.sin(p8Time * 2) * (5 + p8Time % 10); 
    
    drawGradientTriangle(c8, p8.width/2 + 10 + wobbleX, p8.height/2, 28, 150, 255, 150, 1);

    requestAnimationFrame(preview8);
}
preview8();