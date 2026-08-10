// ==========================================
// CÍRCULO 1: MULTITOUCH (SOSTENER Y ARRASTRAR)
// ==========================================
function startCirculo1() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;

    let colors = [
        { name: 'violet', r: 200, g: 162, b: 255 },
        { name: 'green', r: 150, g: 230, b: 150 } // Se usa verde como solicitaste, aunque la ref sea amarilla
    ];

    let shuffledColors = Math.random() > 0.5 ? [colors[0], colors[1]] : [colors[1], colors[0]];

    // Posiciones basadas en la estética de la imagen
    let containers = [
        { x: cx - 80, y: cy - 20, radius: 65, color: shuffledColors[0], isPressed: false, touchId: null },
        { x: cx + 70, y: cy - 60, radius: 65, color: shuffledColors[1], isPressed: false, touchId: null }
    ];

    let orbs = [
        { id: 1, startX: cx - 20, startY: cy + 90, x: cx - 20, y: cy + 90, radius: 18, color: colors[1], isDragging: false, touchId: null, state: 'idle' },
        { id: 2, startX: cx + 80, startY: cy + 70, x: cx + 80, y: cy + 70, radius: 18, color: colors[0], isDragging: false, touchId: null, state: 'idle' }
    ];

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
                if (Math.hypot(pos.x - o.x, pos.y - o.y) < o.radius * 3 && o.state !== 'accepted') {
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
    mainCanvas.onmousedown = null; mainCanvas.onmousemove = null; mainCanvas.onmouseup = null;

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
                mainCtx.lineWidth = 1;
            }
            mainCtx.strokeStyle = colorStr;
            mainCtx.stroke();
        });

        orbs.forEach(o => {
            if (o.state === 'bouncing') {
                o.x += (o.startX - o.x) * 0.15;
                o.y += (o.startY - o.y) * 0.15;
                if (Math.hypot(o.x - o.startX, o.y - o.startY) < 1) o.state = 'idle';
            } else if (o.state === 'accepted') {
                o.x += (o.targetC.x - o.x) * 0.15;
                o.y += (o.targetC.y - o.y) * 0.15;
                o.radius += (o.targetC.radius * 0.6 - o.radius) * 0.1; 
            }
            drawGradientCircle(mainCtx, o.x, o.y, o.radius, o.color.r, o.color.g, o.color.b, 1);
        });
    }
    
    animate();
}
// ==========================================
// CÍRCULO 2: LANZAMIENTO, DESLIZAMIENTO Y EQUIDAD
// ==========================================
function startCirculo2() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    
    // Contenedores. Ahora baseRadius es el tamaño cuando están VACÍOS (0 orbes)
    let bigC = { x: cx - 75, y: cy, radius: 75, baseRadius: 45, isPressed: false, touchId: null };
    let smallC = { x: cx + 75, y: cy, radius: 45, baseRadius: 45, isPressed: false, touchId: null };
    let pulseTime = 0;
    let isResetting = false;
    let animation;

    // Se inician 6 orbes, todos pertenecientes al círculo grande al principio
    let orbs = [];
    for(let i = 0; i < 6; i++) {
        orbs.push({
            id: i,
            x: bigC.x, 
            y: bigC.y,
            radius: 12,
            vx: 0, vy: 0,
            isDragging: false, touchId: null, state: 'idle',
            owner: 'big', // Puede ser 'big' o 'small'
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

            // Seleccionar/Abrir contenedor pequeño
            if (Math.hypot(pos.x - smallC.x, pos.y - smallC.y) < smallC.radius * 1.5) {
                smallC.isPressed = true;
                smallC.touchId = touch.identifier;
            }

            // Seleccionar/Abrir contenedor grande (por si quieren devolver bolas)
            if (Math.hypot(pos.x - bigC.x, pos.y - bigC.y) < bigC.radius * 1.5) {
                bigC.isPressed = true;
                bigC.touchId = touch.identifier;
            }

            // Agarrar orbe
            orbs.forEach(o => {
                if (Math.hypot(pos.x - o.x, pos.y - o.y) < o.radius * 3 && o.state === 'idle' && !isResetting) {
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

            // Mantener presionado el pequeño
            if (smallC.touchId === touch.identifier) {
                smallC.isPressed = Math.hypot(pos.x - smallC.x, pos.y - smallC.y) <= smallC.radius * 2;
            }
            // Mantener presionado el grande
            if (bigC.touchId === touch.identifier) {
                bigC.isPressed = Math.hypot(pos.x - bigC.x, pos.y - bigC.y) <= bigC.radius * 2;
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
            if (bigC.touchId === touch.identifier) {
                bigC.isPressed = false;
                bigC.touchId = null;
            }

            orbs.forEach(o => {
                if (o.isDragging && o.touchId === touch.identifier) {
                    o.isDragging = false;
                    o.touchId = null;
                    
                    let distToSmall = Math.hypot(o.x - smallC.x, o.y - smallC.y);
                    let distToBig = Math.hypot(o.x - bigC.x, o.y - bigC.y);
                    
                    // Si se soltó en el pequeño y está presionado
                    if (distToSmall < smallC.radius && smallC.isPressed) {
                        o.owner = 'small';
                        o.state = 'idle';
                    } 
                    // Si se soltó en el grande (permite devolver bolas)
                    else if (distToBig < bigC.radius) {
                        o.owner = 'big';
                        o.state = 'idle';
                    } 
                    else {
                        // Lanzamiento con inercia (flick) si quedó afuera
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

        // --- CÁLCULO DE TAMAÑOS DINÁMICOS (EQUIDAD REAL) ---
        // Contamos dinámicamente cuántos orbes tiene cada uno
        let smallCount = orbs.filter(o => o.owner === 'small').length;
        let bigCount = 6 - smallCount;
        
        // Cada orbe suma 5 unidades de tamaño al radio base (45)
        // 0 orbes = radio 45 | 3 orbes = radio 60 | 6 orbes = radio 75
        let targetRadioChico = smallC.baseRadius + (smallCount * 5);
        let targetRadioGrande = bigC.baseRadius + (bigCount * 5);

        // Animación suave de los tamaños
        bigC.radius += (targetRadioGrande - bigC.radius) * 0.1;
        smallC.radius += (targetRadioChico - smallC.radius) * 0.1;

        mainCtx.shadowBlur = 0;

        // --- DIBUJAR CONTENEDOR GRANDE ---
        mainCtx.beginPath();
        mainCtx.arc(bigC.x, bigC.y, bigC.radius, 0, Math.PI * 2);
        // El color se iguala visualmente al llegar a la equidad (3)
        mainCtx.fillStyle = `rgba(200, 162, 255, ${bigCount >= 3 ? '0.4' : '0.2'})`;
        mainCtx.fill();
        mainCtx.strokeStyle = "rgba(200, 162, 255, 1)";
        mainCtx.lineWidth = (bigCount === 3) ? 3 : (bigC.isPressed ? 2.5 : 1.5);
        mainCtx.stroke();

        // --- DIBUJAR CONTENEDOR PEQUEÑO ---
        mainCtx.beginPath();
        mainCtx.arc(smallC.x, smallC.y, smallC.radius, 0, Math.PI * 2);
        
        // Efecto de luz solo si no hay equidad y necesita atención
        if (smallCount !== 3 && !isResetting) {
            mainCtx.shadowBlur = 10 + Math.sin(pulseTime) * 5;
            mainCtx.shadowColor = "rgba(200, 162, 255, 0.6)";
        }
        
        mainCtx.fillStyle = `rgba(200, 162, 255, ${smallCount >= 3 ? '0.4' : (smallC.isPressed ? '0.3' : '0.2')})`;
        mainCtx.fill();
        mainCtx.lineWidth = (smallCount === 3) ? 3 : (smallC.isPressed ? 2.5 : 1.5);
        mainCtx.strokeStyle = "rgba(200, 162, 255, 1)";
        mainCtx.stroke();
        
        mainCtx.shadowBlur = 0; // Reiniciar sombras

        // --- REINICIO POR EQUIDAD PERFECTA ---
        if (smallCount === 3 && bigCount === 3 && !isResetting) {
            // Verificar que todas las bolas ya estén quietas (idle)
            let allSettled = orbs.every(o => o.state === 'idle');
            if (allSettled) {
                isResetting = true;
                setTimeout(() => {
                    cancelAnimationFrame(animation);
                    startCirculo2(); // Reinicia la experiencia
                }, 3000); // 3 segundos contemplando la equidad
            }
        }

        // --- LÓGICA DE ORBES ---
        orbs.forEach((o, index) => {
            let targetCenter = o.owner === 'big' ? bigC : smallC;

            if (o.state === 'idle') {
                // Se distribuyen suavemente en forma circular dentro de su contenedor
                let angle = (o.id * Math.PI * 2) / (targetCenter.owner === 'big' ? bigCount : smallCount);
                // Distancia al centro proporcional al tamaño del círculo
                let offsetDist = targetCenter.radius * 0.4; 
                let tx = targetCenter.x + Math.cos(angle) * offsetDist;
                let ty = targetCenter.y + Math.sin(angle) * offsetDist;

                o.x += (tx - o.x) * 0.05;
                o.y += (ty - o.y) * 0.05;
                
                // Limitar para que no se salgan del borde
                let distToCenter = Math.hypot(o.x - targetCenter.x, o.y - targetCenter.y);
                if (distToCenter > targetCenter.radius - o.radius - 2) {
                    let limitAngle = Math.atan2(o.y - targetCenter.y, o.x - targetCenter.x);
                    o.x = targetCenter.x + Math.cos(limitAngle) * (targetCenter.radius - o.radius - 2);
                    o.y = targetCenter.y + Math.sin(limitAngle) * (targetCenter.radius - o.radius - 2);
                }

            } else if (o.state === 'flying') {
                o.x += o.vx;
                o.y += o.vy;
                o.vx *= 0.96; 
                o.vy *= 0.96;

                let distToSmall = Math.hypot(o.x - smallC.x, o.y - smallC.y);
                let distToBig = Math.hypot(o.x - bigC.x, o.y - bigC.y);
                
                // Si en el aire entran a un círculo, se las apropia
                if (distToSmall < smallC.radius && smallC.isPressed) {
                    o.owner = 'small';
                    o.state = 'idle';
                } else if (distToBig < bigC.radius && bigC.isPressed) {
                    o.owner = 'big';
                    o.state = 'idle';
                }
                
                // Si pierde inercia y no cayó en ninguno, vuelve a su dueño original
                if (Math.abs(o.vx) < 0.5 && Math.abs(o.vy) < 0.5) {
                    o.state = 'returning';
                }
            } else if (o.state === 'returning') {
                o.x += (targetCenter.x - o.x) * 0.05;
                o.y += (targetCenter.y - o.y) * 0.05;
                if (Math.hypot(o.x - targetCenter.x, o.y - targetCenter.y) < 20) o.state = 'idle';
            }

            // --- DIBUJADO DE ORBES ---
            if (typeof drawGradientCircle === 'function') {
                drawGradientCircle(mainCtx, o.x, o.y, o.radius, 200, 162, 255, 1);
            } else {
                mainCtx.beginPath();
                mainCtx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
                mainCtx.fillStyle = "rgb(200, 162, 255)";
                mainCtx.fill();
            }
        });
    }
    animate();
}
// ==========================================
// CÍRCULO 3: UNIÓN Y SATURACIÓN
// ==========================================
function startCirculo3() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    
    let c1 = { x: cx, y: cy - 80, radius: 35 };
    let c2 = { x: cx, y: cy + 80, radius: 35 };

    // Valores iniciales y actuales (r, g, b desaturado)
    let baseColor = { r: 180, g: 180, b: 180 };
    let targetColor = { r: 200, g: 162, b: 255 }; // Violeta saturado
    let currentColor = { r: 180, g: 180, b: 180 };

    function handleMultiTouch(e) {
        if (e.touches.length >= 2) {
            const rect = mainCanvas.getBoundingClientRect();
            let x1 = (e.touches[0].clientX - rect.left) * (mainCanvas.width / rect.width);
            let y1 = (e.touches[0].clientY - rect.top) * (mainCanvas.height / rect.height);
            let x2 = (e.touches[1].clientX - rect.left) * (mainCanvas.width / rect.width);
            let y2 = (e.touches[1].clientY - rect.top) * (mainCanvas.height / rect.height);

            c1.x = x1; c1.y = y1;
            c2.x = x2; c2.y = y2;

            // Distancia entre los dos dedos
            let distance = Math.hypot(x1 - x2, y1 - y2);
            
            // Si la distancia es mayor a 300, factor 0 (gris). Si es 0, factor 1 (saturado).
            let factor = Math.max(0, Math.min(1, 1 - (distance / 300)));

            currentColor.r = baseColor.r + (targetColor.r - baseColor.r) * factor;
            currentColor.g = baseColor.g + (targetColor.g - baseColor.g) * factor;
            currentColor.b = baseColor.b + (targetColor.b - baseColor.b) * factor;

            // Crecer un poco al juntarse
            c1.radius = 35 + (factor * 20);
            c2.radius = c1.radius;

        } else {
            // Regresar a estado inicial si sueltan
            currentColor = { ...baseColor };
            c1.radius = 35;
            c2.radius = 35;
        }
    }

    mainCanvas.ontouchstart = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchmove = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchend = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.ontouchcancel = (e) => { e.preventDefault(); handleMultiTouch(e); };
    mainCanvas.onmousedown = null; mainCanvas.onmousemove = null; mainCanvas.onmouseup = null;

    function animate() {
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        // Si no hay 2 toques, devolver lentamente a su posición original
        if (!mainCanvas.ontouchmove || !navigator.maxTouchPoints) {
            // Un pequeño resguardo si queremos animar la vuelta
        }

        drawGradientCircle(mainCtx, c1.x, c1.y, c1.radius, currentColor.r, currentColor.g, currentColor.b, 1);
        drawGradientCircle(mainCtx, c2.x, c2.y, c2.radius, currentColor.r, currentColor.g, currentColor.b, 1);
    }
    animate();
}
