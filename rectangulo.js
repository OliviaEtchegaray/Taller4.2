
// 1

function startBlue1(){
    let squares = [];
    let startTime = Date.now();
    let initialLifespan = 4.0; 
    let minLifespan = 0.8;     

    // Guardamos la posición del último tap. Iniciamos en el centro de la pantalla.
    let lastX = mainCanvas.width / 2;
    let lastY = mainCanvas.height / 2;

    const bgColors = ["rgba(200, 162, 200, 1)", "rgba(255, 235, 150, 1)", "rgba(255, 200, 150, 1)"];
    let currentBg = -1;

    function handleTap(e) {
        const rect = mainCanvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let targetX = (clientX - rect.left) * (mainCanvas.width / rect.width);
        let targetY = (clientY - rect.top) * (mainCanvas.height / rect.height);

        let elapsedSeconds = (Date.now() - startTime) / 1000;
        let currentLifespan = Math.max(minLifespan, initialLifespan - (elapsedSeconds * 0.05));

        currentBg = (squares.length + 1) % bgColors.length;

        squares.push({
            x: targetX,
            y: targetY,
            // Nace en la posición del click anterior
            currentX: lastX,
            currentY: lastY,
            size: 70,
            trails: [],
            maxLife: currentLifespan,
            life: currentLifespan,
            alpha: 1
        });

        // Actualizamos el último tap para el siguiente cuadrado
        lastX = targetX;
        lastY = targetY;
    }

    mainCanvas.onmousedown = handleTap;
    mainCanvas.ontouchstart = (e) => { e.preventDefault(); handleTap(e); };

    function animate() {
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        if (currentBg !== -1) {
            drawRadialBackground(mainCtx, mainCanvas, bgColors[currentBg]);
        }

        for (let i = squares.length - 1; i >= 0; i--) {
            let sq = squares[i];

            sq.currentX += (sq.x - sq.currentX) * 0.15;
            sq.currentY += (sq.y - sq.currentY) * 0.15;

            sq.life -= 1 / 60;
            sq.alpha = Math.max(0, sq.life / sq.maxLife);

            if (Math.abs(sq.x - sq.currentX) > 1 || Math.abs(sq.y - sq.currentY) > 1) {
                sq.trails.push({
                    x: sq.currentX,
                    y: sq.currentY,
                    size: sq.size,
                    alpha: sq.alpha * 0.6
                });
            }

            sq.trails.forEach(t => {
                drawGradientSquare(mainCtx, t.x, t.y, t.size, t.alpha);
                t.alpha -= 0.03; 
            });
            sq.trails = sq.trails.filter(t => t.alpha > 0);

            if (sq.alpha > 0) {
                drawGradientSquare(mainCtx, sq.currentX, sq.currentY, sq.size, sq.alpha);
            }

            if (sq.life <= 0) {
                squares.splice(i, 1);
            }
        }
    }

    animate();
}
// ==========================================
// BLUE 2: RECTÁNGULOS MULTIPLICÁNDOSE (ADAPTADO A HORIZONTAL)
// ==========================================
function startBlue2() {
    let time = 0;
    let squares = [];
    let nextId = 1;
    
    let baseSize = Math.min(mainCanvas.width, mainCanvas.height) * 0.15; // Tamaño dinámico

    squares.push({
        id: 0,
        parent: null,
        x: mainCanvas.width / 2,
        y: mainCanvas.height / 2,
        targetX: mainCanvas.width / 2,
        targetY: mainCanvas.height / 2,
        size: baseSize,
        targetSize: baseSize,
        alpha: 1,
        phase: 'initial', 
        clicks: 0
    });

    function handleTap(e) {
        const rect = mainCanvas.getBoundingClientRect();
        let cx = e.touches ? e.touches[0].clientX : e.clientX;
        let cy = e.touches ? e.touches[0].clientY : e.clientY;
        let tx = (cx - rect.left) * (mainCanvas.width / rect.width);
        let ty = (cy - rect.top) * (mainCanvas.height / rect.height);

        for (let i = squares.length - 1; i >= 0; i--) {
            let sq = squares[i];
            
            if (sq.phase === 'fading' || sq.phase === 'waiting') continue; 
            
            let hitSize = sq.size * 1.5; 
            if (Math.abs(tx - sq.x) < hitSize && Math.abs(ty - sq.y) < hitSize) {
                
                if (sq.phase === 'initial') {
                    sq.phase = 'waiting'; 
                    let angle = Math.random() * Math.PI * 2;
                    
                    // CAMBIO AQUÍ: Distancia muy amplia basada en el ancho de la pantalla
                    let dist = (mainCanvas.width * 0.25) + (Math.random() * (mainCanvas.width * 0.15)); 

                    let newX = sq.x + Math.cos(angle) * dist;
                    let newY = sq.y + Math.sin(angle) * dist;

                    // CAMBIO AQUÍ: Margen más grande para evitar recortes en bordes
                    let margin = baseSize; 

                    let boundedX = Math.max(margin, Math.min(mainCanvas.width - margin, newX));
                    let boundedY = Math.max(margin, Math.min(mainCanvas.height - margin, newY));

                    squares.push({
                        id: nextId++,
                        parent: sq,
                        x: sq.x,
                        y: sq.y,
                        targetX: boundedX,
                        targetY: boundedY,
                        size: baseSize * 0.3, // Nace chiquito
                        targetSize: baseSize * 0.3,
                        alpha: 1,
                        phase: 'baby',
                        clicks: 0
                    });

                    if (sq.parent && sq.parent.phase === 'waiting') {
                        sq.parent.phase = 'fading';
                    }

                } else if (sq.phase === 'baby') {
                    sq.clicks++;
                    // Crecen de a poco hasta el tamaño adulto
                    if (sq.clicks === 1) sq.targetSize = baseSize * 0.5;
                    if (sq.clicks === 2) sq.targetSize = baseSize * 0.75;
                    if (sq.clicks === 3) {
                        sq.targetSize = baseSize;
                        sq.phase = 'initial'; 
                    }
                }
                break;
            }
        }
    }

    mainCanvas.onmousedown = handleTap;
    mainCanvas.ontouchstart = (e) => { e.preventDefault(); handleTap(e); };

    function animate() {
        let animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        time += 0.1;

        for (let i = squares.length - 1; i >= 0; i--) {
            let sq = squares[i];
            
            sq.x += (sq.targetX - sq.x) * 0.12;
            sq.y += (sq.targetY - sq.y) * 0.12;
            sq.size += (sq.targetSize - sq.size) * 0.15;

            let drawSize = sq.size;

            if (sq.phase === 'initial' || sq.phase === 'baby') {
                drawSize *= (1 + Math.sin(time) * 0.08); 
            }

            if (sq.phase === 'fading') {
                sq.alpha -= 0.015; 
            }

            if (sq.alpha > 0) {
                // Asegúrate de tener definida tu función drawGradientSquare en tu proyecto principal
                if (typeof drawGradientSquare === 'function') {
                    drawGradientSquare(mainCtx, sq.x, sq.y, drawSize, Math.max(0, sq.alpha));
                }
            } else {
                squares.splice(i, 1);
            }
        }
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
