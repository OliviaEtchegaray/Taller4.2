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
// CÍRCULO 2: LANZAMIENTO Y DESLIZAMIENTO
// ==========================================
function startCirculo2() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    
    // Contenedores con un radio base para calcular el crecimiento
    let bigC = { x: cx - 60, y: cy, radius: 70, baseRadius: 70 };
    let smallC = { x: cx + 80, y: cy, radius: 45, baseRadius: 45, isPressed: false, touchId: null, acceptedCount: 0 };
    let pulseTime = 0;
    let isResetting = false;

    // Se inician 6 orbes en el círculo grande
    let orbs = [];
    for(let i=0; i<6; i++) {
        orbs.push({
            id: i,
            x: bigC.x, 
            y: bigC.y,
            radius: 12,
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

            // Seleccionar contenedor vacio (pequeño)
            if (Math.hypot(pos.x - smallC.x, pos.y - smallC.y) < smallC.radius * 1.5) {
                smallC.isPressed = true;
                smallC.touchId = touch.identifier;
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

            if (smallC.touchId === touch.identifier) {
                if (Math.hypot(pos.x - smallC.x, pos.y - smallC.y) > smallC.radius * 2) {
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
                    
                    // Si se soltó directamente dentro del pequeño y está presionado
                    if (distToSmall < smallC.radius && smallC.isPressed && smallC.acceptedCount < 3) {
                        o.state = 'accepted';
                        smallC.acceptedCount++;
                    } else {
                        // Lanzamiento con inercia (flick)
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

        // --- CÁLCULO DE TAMAÑOS DINÁMICOS (EQUIDAD) ---
        // Punto de equilibrio donde ambos círculos tendrán el mismo tamaño
        let radioEquilibrio = (bigC.baseRadius + smallC.baseRadius) / 2;
        let factorCrecimiento = Math.min(smallC.acceptedCount, 3);
        
        // Cuánto debe cambiar el radio por cada orbe aceptado
        let pasoGrande = (bigC.baseRadius - radioEquilibrio) / 3; 
        let pasoChico = (radioEquilibrio - smallC.baseRadius) / 3;

        let targetRadioGrande = bigC.baseRadius - (factorCrecimiento * pasoGrande); 
        let targetRadioChico = smallC.baseRadius + (factorCrecimiento * pasoChico);

        // Animación suave de los contenedores
        bigC.radius += (targetRadioGrande - bigC.radius) * 0.1;
        smallC.radius += (targetRadioChico - smallC.radius) * 0.1;

        // Limpiar sobras de sombras antes de dibujar
        mainCtx.shadowBlur = 0;

        // --- DIBUJAR CONTENEDOR GRANDE ---
        mainCtx.beginPath();
        mainCtx.arc(bigC.x, bigC.y, bigC.radius, 0, Math.PI * 2);
        mainCtx.fillStyle = "rgba(200, 162, 255, 0.4)"; // Relleno violeta
        mainCtx.fill();
        mainCtx.strokeStyle = "rgba(200, 162, 255, 1)";
        mainCtx.lineWidth = 2;
        mainCtx.stroke();

        // --- DIBUJAR CONTENEDOR PEQUEÑO ---
        mainCtx.beginPath();
        mainCtx.arc(smallC.x, smallC.y, smallC.radius, 0, Math.PI * 2);
        let alphaC2 = 0.3 + Math.abs(Math.sin(pulseTime)) * 0.7; 
        
        // Efecto de luz violeta cuando requiere orbes
        if (smallC.acceptedCount < 3) {
            mainCtx.shadowBlur = 15 + Math.sin(pulseTime) * 10;
            mainCtx.shadowColor = "rgba(200, 162, 255, 0.8)";
        }
        
        // Si tiene 3, se rellena igual que el grande para marcar el empate
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
        
        // Reiniciar las sombras para no afectar a los orbes
        mainCtx.shadowBlur = 0;

        // --- REINICIO POR EMPATE ---
        if (smallC.acceptedCount >= 3 && !isResetting) {
            isResetting = true;
            setTimeout(() => {
                cancelAnimationFrame(animation);
                startCirculo2(); // Reinicia la experiencia
            }, 3000); // 3 segundos de pausa mostrando el empate
        }

        // --- LÓGICA DE ORBES ---
        orbs.forEach((o, index) => {
            if (o.state === 'idle') {
                // Separarlos para que sea fácil deslizar de a uno
                let targetX = bigC.x + bigC.radius - 20;
                let spacing = (bigC.radius * 2) / 7;
                let targetY = (bigC.y - bigC.radius + spacing) + (index * spacing);

                o.x += (targetX - o.x) * 0.05;
                o.y += (targetY - o.y) * 0.05;
                
                // Limitar al interior del círculo grande (dinámico)
                let distToCenter = Math.hypot(o.x - bigC.x, o.y - bigC.y);
                if (distToCenter > bigC.radius - o.radius - 5) {
                    let angle = Math.atan2(o.y - bigC.y, o.x - bigC.x);
                    o.x = bigC.x + Math.cos(angle) * (bigC.radius - o.radius - 5);
                    o.y = bigC.y + Math.sin(angle) * (bigC.radius - o.radius - 5);
                }
            } else if (o.state === 'flying') {
                o.x += o.vx;
                o.y += o.vy;
                o.vx *= 0.96; 
                o.vy *= 0.96;

                let distToSmall = Math.hypot(o.x - smallC.x, o.y - smallC.y);
                
                // Entra si el contenedor chico está presionado y necesita orbes
                if (distToSmall < smallC.radius) {
                    if (smallC.isPressed && smallC.acceptedCount < 3) {
                        o.state = 'accepted';
                        smallC.acceptedCount++;
                    } else {
                        // Rebote si no está apretado o ya tiene 3
                        o.vx *= -1;
                        o.vy *= -1;
                    }
                }
                
                // Si pierde inercia, vuelve
                if (Math.abs(o.vx) < 0.5 && Math.abs(o.vy) < 0.5) {
                    o.state = 'returning';
                }
            } else if (o.state === 'returning') {
                o.x += (bigC.x - o.x) * 0.05;
                o.y += (bigC.y - o.y) * 0.05;
                if (Math.hypot(o.x - bigC.x, o.y - bigC.y) < 20) o.state = 'idle';
            } else if (o.state === 'accepted') {
                // Se agrupan suavemente en el centro del pequeño
                o.x += (smallC.x - o.x) * 0.1;
                o.y += (smallC.y - o.y) * 0.1;
            }

            // --- DIBUJADO DE ORBES (Violetas) ---
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
