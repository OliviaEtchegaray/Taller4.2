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
// ==========================================
// PREVIEW 4 (Círculo 1: Multitouch - Sostener y arrastrar)
// ==========================================
const p4 = document.getElementById("preview4");
const c4 = p4.getContext("2d");
resizePreview(p4);
let p4Time = 0;

function preview4() {
    resizePreview(p4);
    c4.clearRect(0,0,p4.width,p4.height);
    p4Time += 0.04;

    let cx = p4.width / 2;
    let cy = p4.height / 2;

    // Círculo Izquierdo (Borde Verde, inactivo)
    c4.beginPath(); 
    c4.arc(cx - 30, cy - 10, 24, 0, Math.PI*2); 
    c4.strokeStyle = "rgba(150, 230, 150, 1)"; 
    c4.lineWidth = 1.5; 
    c4.stroke();

    // Círculo Derecho (Borde Violeta, presionado/activo)
    c4.beginPath(); 
    c4.arc(cx + 30, cy - 10, 24, 0, Math.PI*2); 
    c4.fillStyle = "rgba(200, 162, 255, 0.2)"; 
    c4.fill();
    c4.strokeStyle = "rgba(200, 162, 255, 1)"; 
    c4.lineWidth = 3; 
    c4.stroke();

    // Bolita Verde (estática, esperando)
    drawGradientCircle(c4, cx - 15, cy + 30, 9, 150, 230, 150, 1);

    // Bolita Violeta (animación simulando que el dedo la arrastra hacia el contenedor derecho)
    let progress = (Math.sin(p4Time * 1.5) + 1) / 2; // Va de 0 a 1
    let startX = cx + 15;
    let startY = cy + 30;
    let targetX = cx + 30;
    let targetY = cy - 10;
    
    let currentX = startX + (targetX - startX) * progress;
    let currentY = startY + (targetY - startY) * progress;

    drawGradientCircle(c4, currentX, currentY, 9, 200, 162, 255, 1);

    requestAnimationFrame(preview4);
}
preview4();

// ==========================================
// PREVIEW 5 (Círculo 2: Lanzamiento a contenedor pequeño)
// ==========================================
const p5 = document.getElementById("preview5");
const c5 = p5.getContext("2d");
resizePreview(p5);
let p5Time = 0;

function preview5(){
    resizePreview(p5);
    c5.clearRect(0,0,p5.width,p5.height);
    p5Time += 0.05;

    let cx = p5.width / 2;
    let cy = p5.height / 2;

    // Círculo Grande contenedor (Izquierda)
    c5.beginPath(); 
    c5.arc(cx - 25, cy, 32, 0, Math.PI*2);
    c5.strokeStyle = "rgba(200, 162, 255, 0.4)"; 
    c5.lineWidth = 1; 
    c5.stroke();

    // Círculo Pequeño receptor (Derecha, parpadeando esperando ser presionado)
    let alpha = 0.2 + Math.abs(Math.sin(p5Time * 2)) * 0.8;
    c5.beginPath(); 
    c5.arc(cx + 35, cy, 20, 0, Math.PI*2);
    c5.strokeStyle = `rgba(200, 162, 255, ${alpha})`; 
    c5.lineWidth = 1.5; 
    c5.stroke();

    // Bolitas dentro del círculo grande empujando hacia la derecha
    let pushOffset = Math.max(0, Math.sin(p5Time * 3)) * 6; // Efecto de empuje
    
    drawGradientCircle(c5, cx - 35, cy - 12, 5.5, 200, 162, 255, 1);
    drawGradientCircle(c5, cx - 30, cy + 12, 5.5, 200, 162, 255, 1);
    drawGradientCircle(c5, cx - 18 + pushOffset*0.5, cy - 5, 5.5, 200, 162, 255, 1);
    drawGradientCircle(c5, cx - 12 + pushOffset, cy + 8, 5.5, 200, 162, 255, 1);

    // Animación de una bolita siendo lanzada (flick) hacia el círculo pequeño
    let flyProgress = (p5Time * 0.6) % 1; // Bucle de 0 a 1
    if (flyProgress > 0.1) {
        let flyX = (cx - 10) + ((cx + 35) - (cx - 10)) * ((flyProgress - 0.1) / 0.9);
        let flyY = cy + Math.sin(flyProgress * Math.PI) * -15; // Hace un leve arco al volar
        drawGradientCircle(c5, flyX, flyY, 5.5, 200, 162, 255, 1 - flyProgress); // Se desvanece al llegar
    }

    requestAnimationFrame(preview5);
}
preview5();

// ==========================================
// PREVIEW 6 (Círculo 3: Unión) - Sin cambios
// ==========================================
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


const offsetsPrev = [
    { x: 0, y: -25 },
    { x: -22, y: 15 },
    { x: 22, y: 15 }
];


// PREVIEW 7 (Para Triángulo 1: Sacudida y opacidad independiente)
const p7 = document.getElementById("preview7");
const c7 = p7.getContext("2d");
resizePreview(p7);
let p7Time = 0;
let p7Opacities = [0.2, 0.2, 0.2];

function preview7(){
    resizePreview(p7);
    c7.fillStyle = "#ffffff";
    c7.fillRect(0, 0, p7.width, p7.height);
    p7Time += 0.05;

    // Simular "sacudidas" cada cierto tiempo
    let isShaking = (p7Time % 4) > 2.5; 
    let shakeX = isShaking ? (Math.random() - 0.5) * 6 : 0;
    let shakeY = isShaking ? (Math.random() - 0.5) * 6 : 0;

    // Lado a lado como el original
    let offsets = [{x: -35, y: 0}, {x: 0, y: 0}, {x: 35, y: 0}];

    offsets.forEach((off, i) => {
        if (isShaking) {
            p7Opacities[i] += 0.05 * (i + 1) * 0.5; // Distintas velocidades de carga
            if (p7Opacities[i] > 1) p7Opacities[i] = 0.2; // Simula destello y reinicio
        } else {
            p7Opacities[i] = Math.max(0.2, p7Opacities[i] - 0.02);
        }
        drawGradientTriangle(c7, (p7.width/2) + shakeX + off.x, (p7.height/2) + shakeY + off.y, 20, 50, 205, 50, p7Opacities[i]);
    });
    
    requestAnimationFrame(preview7);
}
preview7();


// PREVIEW 8 (Para Triángulo 2: Desbalance y recuperación)
const p8 = document.getElementById("preview8"); 
const c8 = p8.getContext("2d");
resizePreview(p8);
let p8Time = 0;

function preview8(){
    resizePreview(p8);
    c8.fillStyle = "#ffffff";
    c8.fillRect(0, 0, p8.width, p8.height);
    p8Time += 0.05;

    // 3 piezas lado a lado con distintas volatilidades
    let offsets = [{x: -35, y: 0, mult: 1.5}, {x: 0, y: 0, mult: 0.7}, {x: 35, y: 0, mult: 1.1}];
    
    // Simular tambaleo y pérdida de centro
    let tiltX = Math.sin(p8Time * 2) * 18;
    let tiltY = Math.cos(p8Time * 1.5) * 10;

    offsets.forEach((off) => {
        let currentX = tiltX * off.mult;
        let currentY = tiltY * off.mult;

        // Opacidad baja cuando se alejan mucho (simulando reset)
        let dist = Math.hypot(currentX, currentY);
        let opacity = Math.max(0.15, 1 - (dist / 25));

        drawGradientTriangle(c8, (p8.width/2) + off.x + currentX, (p8.height/2) + off.y + currentY, 20, 50, 205, 50, opacity);
    });

    requestAnimationFrame(preview8);
}
preview8();


// PREVIEW 9 (Para Triángulo 3: Precisión de encastre libre)
const p9 = document.getElementById("preview9"); 
const c9 = p9.getContext("2d");
resizePreview(p9);
let p9Time = 0;

function preview9(){
    resizePreview(p9);
    c9.fillStyle = "#ffffff";
    c9.fillRect(0, 0, p9.width, p9.height);
    p9Time += 0.025; 

    // 3 huecos esparcidos
    let targets = [
        {x: p9.width * 0.3, y: p9.height * 0.3},
        {x: p9.width * 0.7, y: p9.height * 0.4},
        {x: p9.width * 0.5, y: p9.height * 0.7}
    ];

    // Ciclo de animación para que las piezas se unan y se separen
    let cycle = (p9Time % 4) / 4; 
    let progress = 1 - Math.pow(1 - cycle, 3); // Easing suave
    let isMatched = cycle > 0.85; // Brillo final cuando conectan
    let grayIntensity = isMatched ? 255 : 204; 

    targets.forEach((t, i) => {
        // Dibujamos el Hueco Gris (Estética perfecta, sólo en grises)
        drawGradientTriangle(c9, t.x, t.y, 20, grayIntensity, grayIntensity, grayIntensity, 1);
        
        if (!isMatched) {
            // Posiciones iniciales dispersas para las piezas verdes
            let startX = p9.width * (i === 0 ? 0.8 : i === 1 ? 0.2 : 0.8);
            let startY = p9.height * (i === 0 ? 0.8 : i === 1 ? 0.8 : 0.2);

            let currentX = startX + (t.x - startX) * progress;
            let currentY = startY + (t.y - startY) * progress;

            // Dibujamos la pieza verde aproximándose
            drawGradientTriangle(c9, currentX, currentY, 20, 50, 205, 50, 1);
        }
    });

    requestAnimationFrame(preview9);
}
preview9();
