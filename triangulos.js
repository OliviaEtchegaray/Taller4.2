// 1
function startTriangulo1() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    
    // Lógica de fondos
    const bgColors = ["rgba(200, 162, 200, 1)", "rgba(255, 235, 150, 1)", "rgba(255, 200, 150, 1)"]; 
    let currentBg = -1;

    // Posiciones lado a lado e independencia (diferentes multiplicadores de reacción)
    let triangles = [
        { offsetX: -80, offsetY: 0, opacity: 0.2, flashed: false, rate: 1.5 },
        { offsetX: 0, offsetY: 0, opacity: 0.2, flashed: false, rate: 0.8 },
        { offsetX: 80, offsetY: 0, opacity: 0.2, flashed: false, rate: 1.2 }
    ];

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().catch(console.error);
    }

    function triggerFlash(t) {
        t.flashed = true;
        t.opacity = 1;
        currentBg = (currentBg + 1) % bgColors.length; // Cambio de fondo global
        
        setTimeout(() => {
            t.opacity = 0.2;
            t.flashed = false;
        }, 500);
    }

    function handleMotion(event) {
        let acc = event.accelerationIncludingGravity || event.acceleration;
        if (!acc) return;
        
        let force = Math.abs(acc.x||0) + Math.abs(acc.y||0) + Math.abs(acc.z||0);
        if (force > 15) { 
            triangles.forEach(t => {
                if (!t.flashed) {
                    t.opacity += 0.15 * t.rate; // Reacción independiente
                    if (t.opacity >= 1) triggerFlash(t);
                }
            });
        }
    }

    function handleManualSwipe() {
        triangles.forEach(t => {
            if (!t.flashed) {
                t.opacity += 0.1 * t.rate;
                if (t.opacity >= 1) triggerFlash(t);
            }
        });
    }

    window.addEventListener('devicemotion', handleMotion, true);
    mainCanvas.ontouchmove = handleManualSwipe; 
    mainCanvas.onmousemove = handleManualSwipe;

    let oldStop = stopCurrentAnimation;
    stopCurrentAnimation = function() {
        window.removeEventListener('devicemotion', handleMotion, true);
        oldStop();
    };

    function animate() {
        animation = requestAnimationFrame(animate);
        
        // Dibujado del fondo
        if(currentBg !== -1) {
            drawRadialBackground(mainCtx, mainCanvas, bgColors[currentBg]);
        } else {
            mainCtx.fillStyle = "#ffffff";
            mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        }
        
        // Dibujar los 3 triángulos verdes independientes
        triangles.forEach(t => {
            if(t.opacity > 0.2 && !t.flashed) t.opacity -= 0.005;
            // RGB verde estandarizado
            drawGradientTriangle(mainCtx, cx + t.offsetX, cy + t.offsetY, 50, 50, 205, 50, t.opacity);
        });
    }
    animate();
}

// 2
function startTriangulo2() {
    let cx = mainCanvas.width / 2;
    let cy = mainCanvas.height / 2;
    let sensitivity = 1.5; 
    
    // Lógica de fondos
    const bgColors = ["rgba(200, 162, 200, 1)", "rgba(255, 235, 150, 1)", "rgba(255, 200, 150, 1)"]; 
    let currentBg = -1;

    // Posiciones lado a lado e independencia rítmica
    let triangles = [
        { x: cx - 80, y: cy, baseX: cx - 80, baseY: cy, mult: 1.4, fadeOut: 0, resetting: false },
        { x: cx, y: cy, baseX: cx, baseY: cy, mult: 0.7, fadeOut: 0, resetting: false },
        { x: cx + 80, y: cy, baseX: cx + 80, baseY: cy, mult: 1.1, fadeOut: 0, resetting: false }
    ];

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().catch(console.error);
    }

    let difficultyInterval = setInterval(() => sensitivity += 0.8, 10000);

    function handleOrientation(event) {
        if (!event.beta || !event.gamma) return;
        triangles.forEach(t => {
            if (t.resetting) return;
            // Movimiento afectado por el multiplicador individual
            t.x += event.gamma * sensitivity * 0.4 * t.mult;
            t.y += event.beta * sensitivity * 0.4 * t.mult;
            checkFail(t);
        });
    }

    function handleManualDrag(e) {
        const rect = mainCanvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let tx = (clientX - rect.left) * (mainCanvas.width / rect.width);
        let ty = (clientY - rect.top) * (mainCanvas.height / rect.height);
        
        triangles.forEach(t => {
            if (t.resetting) return;
            t.x += (tx - cx) * 0.1 * sensitivity * t.mult;
            t.y += (ty - cy) * 0.1 * sensitivity * t.mult;
            checkFail(t);
        });
    }

    function checkFail(t) {
        if (Math.hypot(t.x - t.baseX, t.y - t.baseY) > mainCanvas.height * 0.35) {
            t.resetting = true;
            currentBg = (currentBg + 1) % bgColors.length; // Flash/Fondo cuando uno pierde el control
        }
    }

    window.addEventListener('deviceorientation', handleOrientation, true);
    mainCanvas.ontouchmove = handleManualDrag;
    mainCanvas.onmousemove = handleManualDrag;

    let oldStop = stopCurrentAnimation;
    stopCurrentAnimation = function() {
        window.removeEventListener('deviceorientation', handleOrientation, true);
        clearInterval(difficultyInterval);
        oldStop();
    };

    function animate() {
        animation = requestAnimationFrame(animate);
        
        if(currentBg !== -1) {
            drawRadialBackground(mainCtx, mainCanvas, bgColors[currentBg]);
        } else {
            mainCtx.fillStyle = "#ffffff"; 
            mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        }

        triangles.forEach(t => {
            if (t.resetting) {
                t.fadeOut += 0.03;
                if (t.fadeOut >= 1) {
                    t.x = t.baseX; 
                    t.y = t.baseY;
                    t.fadeOut = 0;
                    t.resetting = false;
                }
            }
            
            let currentOpacity = Math.max(0, 1 - t.fadeOut);

            if (!t.resetting) {
                t.x += (t.baseX - t.x) * 0.01; 
                t.y += (t.baseY - t.y) * 0.01;
            }

            // Mismo verde y tamaño
            drawGradientTriangle(mainCtx, t.x, t.y, 50, 50, 205, 50, currentOpacity);
        });
    }
    animate();
}

// 3
function startTriangulo3() {
    let gravityX = 0;
    let gravityY = 0;
    let successCount = 0;
    let gameOverTimeout = null;
    let difficultyMultiplier = 1; 

    // Lógica de fondos
    const bgColors = ["rgba(200, 162, 200, 1)", "rgba(255, 235, 150, 1)", "rgba(255, 200, 150, 1)"]; 
    let currentBg = -1;

    let difficultyInterval = setInterval(() => {
        difficultyMultiplier += 0.3;
    }, 5000);

    // Huecos dispersos. Eliminé los ángulos, ahora son rectos e idénticos a los T1 y T2
    let targets = [
        { x: mainCanvas.width * 0.3, y: mainCanvas.height * 0.3, size: 50, matched: false, glow: 0 },
        { x: mainCanvas.width * 0.7, y: mainCanvas.height * 0.4, size: 50, matched: false, glow: 0 },
        { x: mainCanvas.width * 0.5, y: mainCanvas.height * 0.7, size: 50, matched: false, glow: 0 }
    ];

    let pieces = targets.map((t, index) => ({
        x: Math.random() * (mainCanvas.width - 100) + 50,
        y: Math.random() * (mainCanvas.height - 100) + 50,
        vx: 0,
        vy: 0,
        size: 50, 
        targetIndex: index
    }));

    function handleOrientation(event) {
        gravityX = event.gamma * 0.15; 
        gravityY = event.beta * 0.15;
    }
    
    window.addEventListener('deviceorientation', handleOrientation);

    let keys = {};
    window.onkeydown = (e) => keys[e.key] = true;
    window.onkeyup = (e) => keys[e.key] = false;

    let oldStop = stopCurrentAnimation;
    stopCurrentAnimation = function() {
        window.removeEventListener('deviceorientation', handleOrientation);
        clearInterval(difficultyInterval);
        oldStop();
    };

    function animate() {
        animation = requestAnimationFrame(animate);
        
        if(currentBg !== -1) {
            drawRadialBackground(mainCtx, mainCanvas, bgColors[currentBg]);
        } else {
            mainCtx.fillStyle = "#ffffff";
            mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        }

        if (keys["ArrowLeft"]) gravityX = -5;
        if (keys["ArrowRight"]) gravityX = 5;
        if (keys["ArrowUp"]) gravityY = -5;
        if (keys["ArrowDown"]) gravityY = 5;
        if (!keys["ArrowLeft"] && !keys["ArrowRight"] && !keys["ArrowUp"] && !keys["ArrowDown"] && gravityX === 0 && gravityY === 0) {
            gravityX = 0; gravityY = 0;
        }

        // 1. Dibujar Huecos Grises DIRECTAMENTE
        targets.forEach(t => {
            let intensity = t.matched ? (100 + t.glow * 155) : 204;
            // Se dibuja exactamente igual que los verdes, sin wrappers que lo deformen, solo en escala de grises
            drawGradientTriangle(mainCtx, t.x, t.y, t.size, intensity, intensity, intensity, 1);
            if (t.glow > 0) t.glow -= 0.02;
        });

        // 2. Actualizar y Dibujar Piezas Verdes
        successCount = 0;
        pieces.forEach(p => {
            let t = targets[p.targetIndex];

            if (!t.matched) {
                p.vx += gravityX * 0.4 * difficultyMultiplier;
                p.vy += gravityY * 0.4 * difficultyMultiplier;
                
                p.vx *= 0.85;
                p.vy *= 0.85;
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > mainCanvas.width) p.vx *= -0.5;
                if (p.y < 0 || p.y > mainCanvas.height) p.vy *= -0.5;
                p.x = Math.max(0, Math.min(mainCanvas.width, p.x));
                p.y = Math.max(0, Math.min(mainCanvas.height, p.y));

                let dist = Math.hypot(p.x - t.x, p.y - t.y);
                if (dist < 15) { 
                    t.matched = true;
                    t.glow = 1.0; 
                    p.x = t.x; 
                    p.y = t.y;
                    currentBg = (currentBg + 1) % bgColors.length; // Flash de fondo
                }
            }

            if (!t.matched) {
                // Dibujo directo sin rotaciones, color verde idéntico (50, 205, 50)
                drawGradientTriangle(mainCtx, p.x, p.y, p.size, 50, 205, 50, 1);
            } else {
                successCount++;
            }
        });

        // 3. Victoria
        if (successCount === targets.length && !gameOverTimeout) {
            gameOverTimeout = setTimeout(() => {
                const overlay = document.getElementById("overlay");
                if (overlay) overlay.style.display = "none"; 
            }, 1500);
        }
    }
    animate();
}
