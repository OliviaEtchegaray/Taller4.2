// ==========================================
// CÍRCULO 1: MULTITOUCH (SOSTENER Y ARRASTRAR)
// ==========================================
function startCirculo1() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    // Usamos el tamaño menor de la pantalla para que nada se salga
    let minDim = Math.min(mainCanvas.width, mainCanvas.height); 
    
    // Distancias dinámicas adaptables a celular y PC
    let offsetX = minDim * 0.28; 
    let contRadius = minDim * 0.15;
    let orbRadius = minDim * 0.04;
    let orbOffsetY = minDim * 0.25;

    let colors = [
        { name: 'light_violet', r: 200, g: 162, b: 255 },
        { name: 'dark_violet', r: 75, g: 25, b: 130 }
    ];
    let shuffledColors = Math.random() > 0.5 ? [colors[0], colors[1]] : [colors[1], colors[0]];

    let containers = [
        { x: cx - offsetX, y: cy - 20, radius: contRadius, color: shuffledColors[0], isPressed: false, touchId: null },
        { x: cx + offsetX, y: cy - 60, radius: contRadius, color: shuffledColors[1], isPressed: false, touchId: null }
    ];

    let orbs = [
        { id: 1, startX: cx - offsetX * 0.6, startY: cy + orbOffsetY, x: cx - offsetX * 0.6, y: cy + orbOffsetY, radius: orbRadius, color: colors[1], isDragging: false, touchId: null, state: 'idle' },
        { id: 2, startX: cx + offsetX * 0.6, startY: cy + orbOffsetY, x: cx + offsetX * 0.6, y: cy + orbOffsetY, radius: orbRadius, color: colors[0], isDragging: false, touchId: null, state: 'idle' }
    ];

    let isResetting = false;

    function getCanvasPos(touch) {
        const rect = mainCanvas.getBoundingClientRect();
        return {
            x: (touch.clientX - rect.left) * (mainCanvas.width / rect.width),
            y: (touch.clientY - rect.top) * (mainCanvas.height / rect.height)
        };
    }

    function onTouchStart(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch = e.changedTouches[i];
            let pos = getCanvasPos(touch);

            containers.forEach(c => {
                if (Math.hypot(pos.x - c.x, pos.y - c.y) < c.radius) {
                    c.isPressed = true;
                    c.touchId = touch.identifier;
                }
            });

            orbs.forEach(o => {
                if (Math.hypot(pos.x - o.x, pos.y - o.y) < o.radius * 4 && o.state !== 'accepted' && !isResetting) {
                    o.isDragging = true;
                    o.touchId = touch.identifier;
                    o.state = 'idle';
                }
            });
        }
    }

    function onTouchMove(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch = e.changedTouches[i];
            let pos = getCanvasPos(touch);

            orbs.forEach(o => {
                if (o.isDragging && o.touchId === touch.identifier) {
                    o.x = pos.x;
                    o.y = pos.y;
                }
            });

            containers.forEach(c => {
                if (c.touchId === touch.identifier) {
                    if (Math.hypot(pos.x - c.x, pos.y - c.y) > c.radius * 1.5) {
                        c.isPressed = false;
                        c.touchId = null;
                    } else {
                        c.isPressed = true;
                    }
                }
            });
        }
    }

    function onTouchEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch = e.changedTouches[i];

            containers.forEach(c => {
                if (c.touchId === touch.identifier) {
                    c.isPressed = false;
                    c.touchId = null;
                }
            });

            orbs.forEach(o => {
                if (o.isDragging && o.touchId === touch.identifier) {
                    o.isDragging = false;
                    o.touchId = null;

                    let droppedInContainer = null;
                    containers.forEach(c => {
                        if (Math.hypot(o.x - c.x, o.y - c.y) < c.radius) {
                            droppedInContainer = c;
                        }
                    });

                    if (droppedInContainer) {
                        if (droppedInContainer.isPressed && droppedInContainer.color.name === o.color.name) {
                            o.state = 'accepted';
                            o.targetC = droppedInContainer;
                        } else {
                            o.state = 'bouncing';
                        }
                    } else {
                        o.state = 'bouncing';
                    }
                }
            });
        }
    }

    mainCanvas.ontouchstart = (e) => { e.preventDefault(); onTouchStart(e); };
    mainCanvas.ontouchmove = (e) => { e.preventDefault(); onTouchMove(e); };
    mainCanvas.ontouchend = (e) => { e.preventDefault(); onTouchEnd(e); };
    mainCanvas.ontouchcancel = (e) => { e.preventDefault(); onTouchEnd(e); };

    function animate() {
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        containers.forEach(c => {
            mainCtx.beginPath();
            mainCtx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            let colorStr = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, 1)`;
            
            if (c.isPressed) {
                mainCtx.fillStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, 0.2)`;
                mainCtx.fill();
                mainCtx.lineWidth = 4;
            } else {
                mainCtx.lineWidth = 2;
            }
            mainCtx.strokeStyle = colorStr;
            mainCtx.stroke();
        });

        let allDone = true;

        orbs.forEach(o => {
            if (o.state === 'bouncing') {
                o.x += (o.startX - o.x) * 0.15;
                o.y += (o.startY - o.y) * 0.15;
                if (Math.hypot(o.x - o.startX, o.y - o.startY) < 1) o.state = 'idle';
                allDone = false;
            } else if (o.state === 'accepted') {
                o.x += (o.targetC.x - o.x) * 0.15;
                o.y += (o.targetC.y - o.y) * 0.15;
                o.radius += (o.targetC.radius - o.radius) * 0.1; 
                // Revisar si terminó de acomodarse
                if (Math.hypot(o.x - o.targetC.x, o.y - o.targetC.y) > 5) allDone = false;
            } else {
                allDone = false; // Está idle o dragging
            }
            
            if (o.color.name === 'dark_violet') {
                if (typeof drawGradientCircle2 === 'function') drawGradientCircle2(mainCtx, o.x, o.y, o.radius, 1);
            } else {
                drawGradientCircle(mainCtx, o.x, o.y, o.radius, o.color.r, o.color.g, o.color.b, 1);
            }

            if (o.state !== 'accepted' || (o.targetC && o.radius < o.targetC.radius * 0.9)) {
                mainCtx.beginPath();
                mainCtx.arc(o.x, o.y, o.radius * 0.4, 0, Math.PI * 2);
                mainCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                mainCtx.fill();
            }
        });

        // REINICIO INMEDIATO SI TODOS FUERON ACEPTADOS
        if (allDone && !isResetting) {
            isResetting = true;
            setTimeout(() => {
                cancelAnimationFrame(animation);
                startCirculo1();
            }, 600); // 0.6 segundos
        }
    }
    
    animate();
}// ==========================================
// CÍRCULO 2: LANZAMIENTO Y DESLIZAMIENTO
// ==========================================
function startCirculo2() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    let minDim = Math.min(mainCanvas.width, mainCanvas.height);
    
    // Todo relativo para celular!
    let offsetX = minDim * 0.28; 
    let baseRBig = minDim * 0.18;
    let baseRSmall = minDim * 0.08;
    
    let bigC = { x: cx - offsetX, y: cy, radius: baseRBig, baseRadius: baseRBig };
    let smallC = { x: cx + offsetX, y: cy, radius: baseRSmall, baseRadius: baseRSmall, isPressed: false, touchId: null, acceptedCount: 0 };
    
    let pulseTime = 0;
    let isResetting = false;

    let orbs = [];
    for(let i=0; i<6; i++) {
        orbs.push({
            id: i, x: bigC.x, y: bigC.y,
            radius: minDim * 0.03,
            vx: 0, vy: 0,
            isDragging: false, touchId: null, state: 'idle',
            lastTouchs: []
        });
    }

    function getCanvasPos(touch) {
        const rect = mainCanvas.getBoundingClientRect();
        return {
            x: (touch.clientX - rect.left) * (mainCanvas.width / rect.width),
            y: (touch.clientY - rect.top) * (mainCanvas.height / rect.height)
        };
    }

    function onTouchStart(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch = e.changedTouches[i];
            let pos = getCanvasPos(touch);

            if (Math.hypot(pos.x - smallC.x, pos.y - smallC.y) < smallC.radius * 2) {
                smallC.isPressed = true;
                smallC.touchId = touch.identifier;
            }

            orbs.forEach(o => {
                if (Math.hypot(pos.x - o.x, pos.y - o.y) < o.radius * 4 && o.state === 'idle' && !isResetting) {
                    o.isDragging = true;
                    o.touchId = touch.identifier;
                    o.lastTouchs = [{x: pos.x, y: pos.y, time: Date.now()}];
                }
            });
        }
    }

    function onTouchMove(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch = e.changedTouches[i];
            let pos = getCanvasPos(touch);

            orbs.forEach(o => {
                if (o.isDragging && o.touchId === touch.identifier) {
                    o.x = pos.x;
                    o.y = pos.y;
                    o.lastTouchs.push({x: pos.x, y: pos.y, time: Date.now()});
                    if (o.lastTouchs.length > 5) o.lastTouchs.shift();
                }
            });

            if (smallC.touchId === touch.identifier) {
                if (Math.hypot(pos.x - smallC.x, pos.y - smallC.y) > smallC.radius * 2.5) {
                    smallC.isPressed = false;
                    smallC.touchId = null;
                } else {
                    smallC.isPressed = true;
                }
            }
        }
    }

    function onTouchEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch = e.changedTouches[i];

            if (smallC.touchId === touch.identifier) {
                smallC.isPressed = false;
                smallC.touchId = null;
            }

            orbs.forEach(o => {
                if (o.isDragging && o.touchId === touch.identifier) {
                    o.isDragging = false;
                    o.touchId = null;
                    
                    let distToSmall = Math.hypot(o.x - smallC.x, o.y - smallC.y);
                    
                    if (distToSmall < smallC.radius && smallC.isPressed && smallC.acceptedCount < 3) {
                        o.state = 'accepted';
                        smallC.acceptedCount++;
                    } else {
                        if (o.lastTouchs.length > 1) {
                            let first = o.lastTouchs[0];
                            let last = o.lastTouchs[o.lastTouchs.length - 1];
                            let dt = Math.max(1, last.time - first.time);
                            o.vx = ((last.x - first.x) / dt) * 15; 
                            o.vy = ((last.y - first.y) / dt) * 15;
                        }
                        o.state = 'flying';
                    }
                }
            });
        }
    }

    mainCanvas.ontouchstart = (e) => { e.preventDefault(); onTouchStart(e); };
    mainCanvas.ontouchmove = (e) => { e.preventDefault(); onTouchMove(e); };
    mainCanvas.ontouchend = (e) => { e.preventDefault(); onTouchEnd(e); };
    mainCanvas.ontouchcancel = (e) => { e.preventDefault(); onTouchEnd(e); };
    
    function animate() {
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        pulseTime += 0.1;

        // TAMAÑOS: El chico roba el tamaño del grande exactamente al llegar a 3
        let diff = bigC.baseRadius - smallC.baseRadius;
        let prog = Math.min(smallC.acceptedCount, 3) / 3; // 0, 0.33, 0.66, 1
        
        let targetRadioGrande = bigC.baseRadius - (diff * prog); 
        let targetRadioChico = smallC.baseRadius + (diff * prog);

        bigC.radius += (targetRadioGrande - bigC.radius) * 0.1;
        smallC.radius += (targetRadioChico - smallC.radius) * 0.1;

        // DIBUJAR
        mainCtx.beginPath();
        mainCtx.arc(bigC.x, bigC.y, bigC.radius, 0, Math.PI * 2);
        mainCtx.fillStyle = "rgba(200, 162, 255, 0.4)";
        mainCtx.fill();
        mainCtx.strokeStyle = "rgba(200, 162, 255, 1)";
        mainCtx.lineWidth = 2;
        mainCtx.stroke();

        mainCtx.beginPath();
        mainCtx.arc(smallC.x, smallC.y, smallC.radius, 0, Math.PI * 2);
        let alphaC2 = 0.3 + Math.abs(Math.sin(pulseTime)) * 0.7; 
        
        if (smallC.isPressed || smallC.acceptedCount >= 3) {
            mainCtx.fillStyle = `rgba(200, 162, 255, ${smallC.acceptedCount >= 3 ? '0.4' : '0.2'})`;
            mainCtx.fill();
            mainCtx.lineWidth = 3;
            mainCtx.strokeStyle = `rgba(200, 162, 255, 1)`;
        } else {
            mainCtx.lineWidth = 1.5;
            mainCtx.strokeStyle = `rgba(200, 162, 255, ${alphaC2})`;
        }
        mainCtx.stroke();

        // REINICIO
        if (smallC.acceptedCount >= 3 && !isResetting) {
            isResetting = true;
            setTimeout(() => {
                cancelAnimationFrame(animation);
                startCirculo2();
            }, 2000); // 2 segundos
        }

        orbs.forEach((o, index) => {
            if (o.state === 'idle') {
                let targetX = bigC.x + bigC.radius - o.radius - 10;
                let spacing = (bigC.radius * 2) / 7;
                let targetY = (bigC.y - bigC.radius + spacing) + (index * spacing);

                o.x += (targetX - o.x) * 0.05;
                o.y += (targetY - o.y) * 0.05;
                
                let distToCenter = Math.hypot(o.x - bigC.x, o.y - bigC.y);
                if (distToCenter > bigC.radius - o.radius - 5) {
                    let angle = Math.atan2(o.y - bigC.y, o.x - bigC.x);
                    o.x = bigC.x + Math.cos(angle) * (bigC.radius - o.radius - 5);
                    o.y = bigC.y + Math.sin(angle) * (bigC.radius - o.radius - 5);
                }
            } else if (o.state === 'flying') {
                o.x += o.vx;
                o.y += o.vy;
                o.vx *= 0.96; o.vy *= 0.96;

                let distToSmall = Math.hypot(o.x - smallC.x, o.y - smallC.y);
                if (distToSmall < smallC.radius) {
                    if (smallC.isPressed && smallC.acceptedCount < 3) {
                        o.state = 'accepted';
                        smallC.acceptedCount++;
                    } else {
                        o.vx *= -1;
                        o.vy *= -1;
                    }
                }
                
                if (Math.abs(o.vx) < 0.5 && Math.abs(o.vy) < 0.5) o.state = 'returning';
            } else if (o.state === 'returning') {
                o.x += (bigC.x - o.x) * 0.05;
                o.y += (bigC.y - o.y) * 0.05;
                if (Math.hypot(o.x - bigC.x, o.y - bigC.y) < 20) o.state = 'idle';
            } else if (o.state === 'accepted') {
                o.x += (smallC.x - o.x) * 0.1;
                o.y += (smallC.y - o.y) * 0.1;
            }

            if (typeof drawGradientCircle === 'function') {
                drawGradientCircle(mainCtx, o.x, o.y, o.radius, 255, 235, 59, 1);
            }
        });
    }
    animate();
} 
// ==========================================
// CÍRCULO 3: UNIÓN Y SATURACIÓN AL VIOLETA OSCURO
// ==========================================
function startCirculo3() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    let minDim = Math.min(mainCanvas.width, mainCanvas.height);
    
    // Radios y posiciones adaptados a celular
    let baseRadius = minDim * 0.08;
    let offsetY = minDim * 0.25;

    let c1 = { x: cx, y: cy - offsetY, radius: baseRadius };
    let c2 = { x: cx, y: cy + offsetY, radius: baseRadius };

    let baseColor = { r: 130, g: 130, b: 130 };
    let targetColor = { r: 75, g: 25, b: 130 }; 
    let currentColor = { r: 130, g: 130, b: 130 };

    function handleMultiTouch(e) {
        if (e.touches.length >= 2) {
            const rect = mainCanvas.getBoundingClientRect();
            let x1 = (e.touches[0].clientX - rect.left) * (mainCanvas.width / rect.width);
            let y1 = (e.touches[0].clientY - rect.top) * (mainCanvas.height / rect.height);
            let x2 = (e.touches[1].clientX - rect.left) * (mainCanvas.width / rect.width);
            let y2 = (e.touches[1].clientY - rect.top) * (mainCanvas.height / rect.height);

            c1.x = x1; c1.y = y1;
            c2.x = x2; c2.y = y2;

            let distance = Math.hypot(x1 - x2, y1 - y2);
            
            // Distancia máxima dinámica según la pantalla
            let maxDist = minDim * 0.8;
            let factor = Math.max(0, Math.min(1, 1 - (distance / maxDist)));

            currentColor.r = baseColor.r + (targetColor.r - baseColor.r) * factor;
            currentColor.g = baseColor.g + (targetColor.g - baseColor.g) * factor;
            currentColor.b = baseColor.b + (targetColor.b - baseColor.b) * factor;

            let growthFactor = Math.pow(factor, 3); 
            
            // Crecen brutalmente según la pantalla
            c1.radius = baseRadius + (growthFactor * (minDim * 0.45)); 
            c2.radius = c1.radius;

        } else {
            currentColor = { ...baseColor };
            c1.radius = baseRadius;
            c2.radius = baseRadius;
            c1.x = cx; c1.y = cy - offsetY;
            c2.x = cx; c2.y = cy + offsetY;
        }
    }

    mainCanvas.ontouchstart = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchmove = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchend = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchcancel = (e) => { e.preventDefault(); handleMultiTouch(e); };

    function animate() {
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        // AQUÍ ESTÁ EL FIX DEL COLOR: Math.round redondea a números enteros (sin decimales)
        let r = Math.round(currentColor.r);
        let g = Math.round(currentColor.g);
        let b = Math.round(currentColor.b);

        drawGradientCircle(mainCtx, c1.x, c1.y, c1.radius, r, g, b, 1);
        drawGradientCircle(mainCtx, c2.x, c2.y, c2.radius, r, g, b, 1);
    }
    animate();
}
