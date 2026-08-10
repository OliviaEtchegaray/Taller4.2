
// 1

function startBlue1(){
    let trails = [];
    let square = { x: mainCanvas.width / 2, y: mainCanvas.height / 2, size: 70 };
    let pointer = { x: square.x, y: square.y };
    let isCrashed = false; 

    // Lógica de fondos
    const bgColors = ["rgba(200, 162, 200, 1)", "rgba(255, 235, 150, 1)", "rgba(255, 200, 150, 1)"]; 
    let currentBg = -1;

    function updatePointer(e) {
        if(isCrashed) return; 
        const rect = mainCanvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;

        pointer.x = (clientX - rect.left) * (mainCanvas.width / rect.width);
        pointer.y = (clientY - rect.top) * (mainCanvas.height / rect.height);
    }

    mainCanvas.onmousemove = updatePointer;
    mainCanvas.ontouchmove = (e) => { e.preventDefault(); updatePointer(e); };
    mainCanvas.ontouchstart = (e) => { e.preventDefault(); updatePointer(e); };

    function resetSystem() {
        isCrashed = true;
        currentBg = (currentBg + 1) % bgColors.length; 

        setTimeout(() => {
            square.x = mainCanvas.width / 2;
            square.y = mainCanvas.height / 2;
            pointer.x = square.x;
            pointer.y = square.y;
            trails = [];
            isCrashed = false;
        }, 1500); 
    }

    function animate(){
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0,0,mainCanvas.width,mainCanvas.height);

    
        if(currentBg !== -1) {
            drawRadialBackground(mainCtx, mainCanvas, bgColors[currentBg]);
        }

        if(!isCrashed) {
            square.x += (pointer.x - square.x) * 0.12;
            square.y += (pointer.y - square.y) * 0.12;

            for (let i = 0; i < trails.length - 15; i++) {
                let t = trails[i];
                let dx = square.x - t.x;
                let dy = square.y - t.y;
                if (Math.sqrt(dx*dx + dy*dy) < square.size * 0.4 && t.alpha > 0.15) {
                    resetSystem();
                    break;
                }
            }
            trails.push({ x: square.x, y: square.y, alpha: 1, size: square.size });
        }

        trails.forEach(t => {
            drawGradientSquare(mainCtx, t.x, t.y, t.size, t.alpha);
            t.alpha -= 0.012;
        });
        trails = trails.filter(t => t.alpha > 0);
        drawGradientSquare(mainCtx, square.x, square.y, square.size, 1);
    }
    animate();
}


// 2
function startBlue2(){
    let square = { x: mainCanvas.width/2, y: mainCanvas.height/2, size: 80, scale: 1 };
    let minis = [];
    let pulse = 0;
    let hasTouched = false; 

    function spawnMinis() {
        for(let i=0; i<4; i++) {
            minis.push({
                x: square.x, y: square.y,
                size: 15 + Math.random() * 20,
                vx: (Math.random() - 0.5) * 12, 
                vy: (Math.random() - 0.5) * 12, 
                alpha: 1
            });
        }
    }

    function handleInteraction(e) {
        hasTouched = true; 
        square.scale = 1;  

        const rect = mainCanvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        let tx = (clientX - rect.left) * (mainCanvas.width / rect.width);
        let ty = (clientY - rect.top) * (mainCanvas.height / rect.height);

        if (Math.abs(tx - square.x) < square.size && Math.abs(ty - square.y) < square.size) {
            spawnMinis();
        }
    }

    mainCanvas.onmousedown = handleInteraction;
    mainCanvas.ontouchstart = (e) => { e.preventDefault(); handleInteraction(e); };

    function animate(){
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0,0,mainCanvas.width,mainCanvas.height);

        if (!hasTouched) {
            // Aumentamos la velocidad de 0.05 a 0.18
            pulse += 0.18;
            // Aumentamos el tamaño de la expansión de 0.15 a 0.35
            square.scale = 1 + Math.sin(pulse) * 0.35;
        }

        minis.forEach(m => {
            m.x += m.vx;
            m.y += m.vy;

            if (m.x - m.size/2 < 0 || m.x + m.size/2 > mainCanvas.width) m.vx *= -1;
            if (m.y - m.size/2 < 0 || m.y + m.size/2 > mainCanvas.height) m.vy *= -1;

            drawGradientSquare(mainCtx, m.x, m.y, m.size, m.alpha);
            m.alpha -= 0.005; 
        });
        
        minis = minis.filter(m => m.alpha > 0);

        let currentSize = square.size * square.scale;
        drawGradientSquare(mainCtx, square.x, square.y, currentSize, 1);
    }
    animate();
}

//  3


function startBlue3(){
    let trails = [];
    let square = resetSquare();
    let isDragging = false;
    
    // Lógica de fondos idéntica a Blue 1
    const bgColors = ["rgba(200, 162, 200, 1)", "rgba(255, 235, 150, 1)", "rgba(255, 200, 150, 1)"];
    let currentBg = -1;

    function resetSquare() {
        return { x: mainCanvas.width / 2, y: mainCanvas.height / 2, size: 70, alpha: 1 };
    }

    function startDrag(e) {
 
        const rect = mainCanvas.getBoundingClientRect();
        let cx = e.touches ? e.touches[0].clientX : e.clientX;
        let cy = e.touches ? e.touches[0].clientY : e.clientY;
        let x = (cx - rect.left) * (mainCanvas.width / rect.width);
        let y = (cy - rect.top) * (mainCanvas.height / rect.height);
        if (Math.abs(x - square.x) < square.size && Math.abs(y - square.y) < square.size) {
            isDragging = true;
        }
    }

    function dragMove(e) {
        if (!isDragging || square.alpha <= 0) return;
        const rect = mainCanvas.getBoundingClientRect();
        let cx = e.touches ? e.touches[0].clientX : e.clientX;
        let cy = e.touches ? e.touches[0].clientY : e.clientY;
        square.x = (cx - rect.left) * (mainCanvas.width / rect.width);
        square.y = (cy - rect.top) * (mainCanvas.height / rect.height);

        trails.push({ x: square.x, y: square.y, size: square.size, alpha: square.alpha });
        square.alpha -= 0.006; 
    }

    function endDrag() { isDragging = false; }

    mainCanvas.onmousedown = startDrag; mainCanvas.onmousemove = dragMove; mainCanvas.onmouseup = endDrag; mainCanvas.onmouseleave = endDrag;
    mainCanvas.ontouchstart = (e) => { e.preventDefault(); startDrag(e); };
    mainCanvas.ontouchmove = (e) => { e.preventDefault(); dragMove(e); };
    mainCanvas.ontouchend = endDrag;

    function animate(){
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0,0,mainCanvas.width,mainCanvas.height);

        // Reinicio: Aparece y cambia el fondo
        if (square.alpha <= 0 && trails.length === 0) {
            square = resetSquare();
            currentBg = (currentBg + 1) % bgColors.length; // Cambia de fondo
        }

        // Dibujar fondo radial si corresponde
        if(currentBg !== -1) {
            drawRadialBackground(mainCtx, mainCanvas, bgColors[currentBg]);
        }

        trails.forEach(t => {
            drawGradientSquare(mainCtx, t.x, t.y, t.size, t.alpha);
            t.alpha -= 0.015;
        });
        trails = trails.filter(t => t.alpha > 0);

        if (square.alpha > 0) {
            drawGradientSquare(mainCtx, square.x, square.y, square.size, Math.max(0, square.alpha));
        }
    }
    animate();
}
