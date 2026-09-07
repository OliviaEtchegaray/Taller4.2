// ==========================================
// CÍRCULO 1: MULTITOUCH (SOSTENER Y ARRASTRAR)
// ==========================================
function startCirculo1() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    let minDim = Math.min(mainCanvas.width, mainCanvas.height); 
    
    // CORRECCIÓN: Separación horizontal basada en el ancho (ideal para horizontal)
    let offsetX = mainCanvas.width * 0.35; 
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
        let animation = requestAnimationFrame(animate);
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
                if (Math.hypot(o.x - o.targetC.x, o.y - o.targetC.y) > 5) allDone = false;
            } else {
                allDone = false;
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

        if (allDone && !isResetting) {
            isResetting = true;
            setTimeout(() => {
                cancelAnimationFrame(animation);
                startCirculo1();
            }, 600);
        }
    }
    
    animate();
}

// ==========================================
// CÍRCULO 2: LANZAMIENTO Y DESLIZAMIENTO
// ==========================================
function startCirculo2() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    let minDim = Math.min(mainCanvas.width, mainCanvas.height);
    
    // CORRECCIÓN: Separación real en landscape
    let offsetX = mainCanvas.width * 0.35; 
    let baseRBig = minDim * 0.22; // Inicia más grande
    let baseRSmall = minDim * 0.08; // Inicia pequeño
    let finalRadius = minDim * 0.15; // Tamaño final al que llegarán ambos
    
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
        let animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        pulseTime += 0.1;

        // TAMAÑOS: Progresivo para que terminen del MISMO TAMAÑO
        let prog = Math.min(smallC.acceptedCount, 3) / 3; 
        
        let targetRadioGrande = bigC.baseRadius - ((bigC.baseRadius - finalRadius) * prog); 
        let targetRadioChico = smallC.baseRadius + ((finalRadius - smallC.baseRadius) * prog);

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

        // REINICIO (Cuando 3 esferas hayan pasado)
        if (smallC.acceptedCount >= 3 && !isResetting) {
            isResetting = true;
            setTimeout(() => {
                cancelAnimationFrame(animation);
                startCirculo2();
            }, 2000);
        }

        // Reorganizar dinámicamente las bolas que quedan "idle" en el círculo grande
        let idleOrbs = orbs.filter(o => o.state === 'idle' || o.state === 'returning');

        orbs.forEach((o, index) => {
            if (o.state === 'idle') {
                // Buscamos su índice relativo entre las que quedan para que no queden huecos
                let localIndex = idleOrbs.indexOf(o);
                let targetX = bigC.x + bigC.radius - o.radius - 10;
                let spacing = (bigC.radius * 2) / (idleOrbs.length + 1);
                let targetY = (bigC.y - bigC.radius + spacing) + (localIndex * spacing);

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
    
    // CORRECCIÓN: Separación HORIZONTAL para uso en paisaje
    let baseRadius = minDim * 0.08;
    let offsetX = mainCanvas.width * 0.25; 

    // Ahora empiezan separados a los lados (x - offsetX y x + offsetX)
    let c1 = { x: cx - offsetX, y: cy, radius: baseRadius };
    let c2 = { x: cx + offsetX, y: cy, radius: baseRadius };

    let baseColor = { r: 130, g: 130, b: 130 }; // Gris
    let targetColor = { r: 75, g: 25, b: 130 }; // Violeta oscuro
    let currentColor = { r: 130, g: 130, b: 130 };

    // Función de degradado local integrada por si las globales fallan
    function renderCustomGradient(ctx, x, y, radius, r, g, b) {
        let gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, 1)`); 
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 1)`);  

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

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
            
            let maxDist = mainCanvas.width * 0.8;
            let factor = Math.max(0, Math.min(1, 1 - (distance / maxDist)));

            // Modificamos el color hacia el Violeta Oscuro
            currentColor.r = baseColor.r + (targetColor.r - baseColor.r) * factor;
            currentColor.g = baseColor.g + (targetColor.g - baseColor.g) * factor;
            currentColor.b = baseColor.b + (targetColor.b - baseColor.b) * factor;

            let growthFactor = Math.pow(factor, 3); 
            
            c1.radius = baseRadius + (growthFactor * (minDim * 0.45)); 
            c2.radius = c1.radius;

        } else {
            currentColor = { ...baseColor };
            c1.radius = baseRadius;
            c2.radius = baseRadius;
            c1.x = cx - offsetX; c1.y = cy;
            c2.x = cx + offsetX; c2.y = cy;
        }
    }

    mainCanvas.ontouchstart = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchmove = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchend = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchcancel = (e) => { e.preventDefault(); handleMultiTouch(e); };

    function animate() {
        let animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        let r = Math.round(currentColor.r);
        let g = Math.round(currentColor.g);
        let b = Math.round(currentColor.b);

        renderCustomGradient(mainCtx, c1.x, c1.y, c1.radius, r, g, b);
        renderCustomGradient(mainCtx, c2.x, c2.y, c2.radius, r, g, b);
    }
    animate();
}
