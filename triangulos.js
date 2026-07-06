
// 1

function startTriangulo1() {
    let cx = mainCanvas.width / 2 + 20;
    let cy = mainCanvas.height / 2;
    let opacity = 0.2;

    // Pedir permisos obligatorios en iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().catch(console.error);
    }

    function handleMotion(event) {
        let acc = event.accelerationIncludingGravity || event.acceleration;
        if (!acc) return;
        
        let force = Math.abs(acc.x||0) + Math.abs(acc.y||0) + Math.abs(acc.z||0);
        if (force > 15) { 
            opacity += 0.15;
            if (opacity >= 1) setTimeout(() => opacity = 0.2, 500); 
        }
    }

    // Fallback por si lo usan deslizando el dedo o ratón
    function handleManualSwipe() {
        opacity += 0.1;
        if (opacity >= 1) setTimeout(() => opacity = 0.2, 500);
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
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        
        if(opacity > 0.2) opacity -= 0.005;

   
        drawGradientTriangle(mainCtx, cx, cy, 70, 150, 255, 150, opacity);
    }
    animate();
}

//  2

function startTriangulo2() {
    let cx = mainCanvas.width / 2 + 20;
    let cy = mainCanvas.height / 2;
    let triX = cx, triY = cy;
    let sensitivity = 1, fails = 0;
    let bgColors = ["#ffffff", "#e6ffe6", "#ccffcc", "#99ff99"]; // Fondos verdosos

    // Pedir permisos en iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().catch(console.error);
    }

    let difficultyInterval = setInterval(() => sensitivity += 0.5, 10000);

    function handleOrientation(event) {
        if (!event.beta || !event.gamma) return;
        triX += event.gamma * sensitivity * 0.2;
        triY += event.beta * sensitivity * 0.2;
        checkFail();
    }

    // Fallback simulado para PC arrastrando (simulando desbalance)
    function handleManualDrag(e) {
        const rect = mainCanvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let tx = (clientX - rect.left) * (mainCanvas.width / rect.width);
        let ty = (clientY - rect.top) * (mainCanvas.height / rect.height);
        
       
        triX += (tx - cx) * 0.05 * sensitivity;
        triY += (ty - cy) * 0.05 * sensitivity;
        checkFail();
    }

    function checkFail() {
        if (Math.hypot(triX - cx, triY - cy) > mainCanvas.height * 0.4) {
            fails++;
            triX = cx; triY = cy;
            sensitivity = 1;
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
        mainCtx.fillStyle = bgColors[Math.min(fails, bgColors.length - 1)];
        mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

        triX += (cx - triX) * 0.02; // Retorno elástico
        triY += (cy - triY) * 0.02;

        drawGradientTriangle(mainCtx, triX, triY, 70, 150, 255, 150, 1);
    }
    animate();
}

function startTriangulo3() {

    let gravityX = 0;
    let gravityY = 0;
    let successCount = 0;
    let gameOverTimeout = null;


    let targets = [
        { x: mainCanvas.width * 0.25, y: mainCanvas.height * 0.3, size: 60, angle: 0, matched: false, glow: 0 },
        { x: mainCanvas.width * 0.75, y: mainCanvas.height * 0.4, size: 60, angle: Math.PI * 2 / 3, matched: false, glow: 0 },
        { x: mainCanvas.width * 0.5,  y: mainCanvas.height * 0.7, size: 60, angle: Math.PI * 4 / 3, matched: false, glow: 0 }
    ];

    let pieces = targets.map((t, index) => ({
        x: Math.random() * (mainCanvas.width - 100) + 50,
        y: Math.random() * (mainCanvas.height - 100) + 50,
        vx: 0,
        vy: 0,
        size: 58, 
        angle: t.angle, 
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

    function drawTriangle(ctx, x, y, size, angle, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
    
        ctx.moveTo(0, -size / Math.sqrt(3));
        ctx.lineTo(-size / 2, size / (2 * Math.sqrt(3)));
        ctx.lineTo(size / 2, size / (2 * Math.sqrt(3)));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    function animate() {
        animation = requestAnimationFrame(animate);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        // Fallback de teclado si no hay acelerómetro activo
        if (keys["ArrowLeft"]) gravityX = -5;
        if (keys["ArrowRight"]) gravityX = 5;
        if (keys["ArrowUp"]) gravityY = -5;
        if (keys["ArrowDown"]) gravityY = 5;
        if (!keys["ArrowLeft"] && !keys["ArrowRight"] && !keys["ArrowUp"] && !keys["ArrowDown"] && gravityX === 0 && gravityY === 0) {
            gravityX = 0; gravityY = 0;
        }

        // 1. Dibujar Huecos Grises (Targets)
        targets.forEach(t => {
            let color = `rgb(${100 + t.glow * 155}, ${100 + t.glow * 155}, ${100 + t.glow * 155})`;
            drawTriangle(mainCtx, t.x, t.y, t.size, t.angle, t.matched ? color : "#555555");
            
            // Reducir el brillo paulatinamente si ya se iluminó
            if (t.glow > 0) t.glow -= 0.02;
        });

        // 2. Actualizar y Dibujar Piezas Rojas
        successCount = 0;
        pieces.forEach(p => {
            let t = targets[p.targetIndex];

            if (!t.matched) {
                // Aplicar aceleración por inclinación (van rápido)
                p.vx += gravityX * 0.4;
                p.vy += gravityY * 0.4;
                
                // Fricción para que no se descontrolen infinitamente
                p.vx *= 0.85;
                p.vy *= 0.85;

                p.x += p.vx;
                p.y += p.vy;

                // Límites de la pantalla (Bounce simple)
                if (p.x < 0 || p.x > mainCanvas.width) p.vx *= -0.5;
                if (p.y < 0 || p.y > mainCanvas.height) p.vy *= -0.5;
                p.x = Math.max(0, Math.min(mainCanvas.width, p.x));
                p.y = Math.max(0, Math.min(mainCanvas.height, p.y));

                // Detección de encaje (Distancia corta entre centros)
                let dist = Math.hypot(p.x - t.x, p.y - t.y);
                if (dist < 12) { 
                    t.matched = true;
                    t.glow = 1.0; // Activa iluminación máxima
                    p.x = t.x; // Clavar en su lugar exacto
                    p.y = t.y;
                }
            }

            // Dibujar la pieza roja si no está totalmente encajada o si brilla
            if (!t.matched) {
                drawTriangle(mainCtx, p.x, p.y, p.size, p.angle, "#FF0000");
            } else {
                successCount++;
            }
        });

        // 3. Condición de Victoria Anticlímax (Todos encajados)
        if (successCount === targets.length && !gameOverTimeout) {
            // Espera 1.5 segundos iluminados creando expectativa, y destruye la escena volviendo al menú
            gameOverTimeout = setTimeout(() => {
                window.removeEventListener('deviceorientation', handleOrientation);
                cancelAnimationFrame(animation);
                
                // Lógica para cerrar el overlay/volver al menú
                const overlay = document.getElementById("overlay");
                if (overlay) overlay.style.display = "none"; 
                
                alert("Fin del sistema. Volviendo al menú."); // Remueve o cambia por tu función de cierre
            }, 1500);
        }
    }

    animate();
}