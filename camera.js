
const camera = (() => {
    let canvas;
    let c;
    let video;
    let stream;

    let drawingCanvas;
    let drawingContext;

    let animationId = null;
    let running = false;
    let starting = false;
    let sessionId = 0;
    let gridReady = false;

    let cols = 80;
    let rows = 0;
    let fontSize = 0;
    let offsetX = 0;
    let offsetY = 0;

    let innerX = 0;
    let innerY = 0;
    let innerWidth = 0;
    let innerHeight = 0;

    let lastCanvasWidth = 0;
    let lastCanvasHeight = 0;

    let chars = " .:-=+*#%@";
    let color = '#008F46';

    const charSets = {
        ascii: " .:-=+*#%@",
        binary: " 0101",
        blocks: " ░▒▓█"
    };

    const colorSets = {
        green: '#008F46',
        realColor: 'colorMode'
    };

    const MIN_COLS = 20;
    const MAX_COLS = 200;
    const COLS_STEP = 5;

    // Calculate the centered camera window.

    const getFrame = () => {
        const frameWidth = Math.min(
            canvas.width * 0.76,
            1100
        );

        const frameHeight = canvas.height * 0.74;

        const x = (canvas.width - frameWidth) / 2;
        const y = (canvas.height - frameHeight) / 2;

        return {
            x,
            y,
            width: frameWidth,
            height: frameHeight
        };
    };

    // Calculate the actual ASCII drawing area.

    const setGrid = () => {
        if (
            !canvas ||
            !video ||
            !video.videoWidth ||
            !video.videoHeight ||
            !drawingCanvas
        ) {
            gridReady = false;
            return false;
        }

        const frame = getFrame();

        const headerHeight = 46;
        const footerHeight = 34;
        const padding = 20;

        innerX = frame.x + padding;
        innerY = frame.y + headerHeight;

        innerWidth = frame.width - padding * 2;
        innerHeight =
            frame.height - headerHeight - footerHeight;

        rows = Math.max(
            1,
            Math.round(
                cols *
                (video.videoHeight / video.videoWidth) *
                0.55
            )
        );

        drawingCanvas.width = cols;
        drawingCanvas.height = rows;

        fontSize = Math.min(
            innerWidth / (cols * 0.6),
            innerHeight / rows
        );

        offsetX =
            innerX +
            (innerWidth - cols * fontSize * 0.6) / 2;

        offsetY =
            innerY +
            (innerHeight - rows * fontSize) / 2;

        lastCanvasWidth = canvas.width;
        lastCanvasHeight = canvas.height;

        gridReady = true;

        return true;
    };

    const getBrightness = (x, y, frame) => {
        const i = (y * cols + x) * 4;

        return (
            0.299 * frame[i] +
            0.587 * frame[i + 1] +
            0.114 * frame[i + 2]
        ) / 255;
    };

    const getColor = (x, y, frame) => {
        const i = (y * cols + x) * 4;

        const toHex = value =>
            value.toString(16).padStart(2, '0');

        return (
            '#' +
            toHex(frame[i]) +
            toHex(frame[i + 1]) +
            toHex(frame[i + 2])
        );
    };

    // Draw startup and error messages.

    const drawMessage = (message, detail = '') => {
        if (!canvas || !c)
            return;

        c.fillStyle = '#050806';
        c.fillRect(0, 0, canvas.width, canvas.height);

        c.fillStyle = '#008F46';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = '24px "VT323", monospace';

        c.fillText(
            message,
            canvas.width / 2,
            canvas.height / 2 - (detail ? 14 : 0)
        );

        if (detail) {
            c.font = '18px "VT323", monospace';

            c.fillText(
                detail,
                canvas.width / 2,
                canvas.height / 2 + 18
            );
        }

        c.textAlign = 'left';
    };

    // Draw the camera window and its frame.

    const drawFrameChrome = () => {
        const frame = getFrame();

        c.fillStyle = '#050806';
        c.fillRect(0, 0, canvas.width, canvas.height);

        // Main border

        c.strokeStyle = '#008F46';
        c.lineWidth = 2;

        c.strokeRect(
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );

        // Header separator

        c.beginPath();
        c.moveTo(frame.x, frame.y + 46);
        c.lineTo(frame.x + frame.width, frame.y + 46);
        c.stroke();

        // Footer separator

        c.beginPath();
        c.moveTo(
            frame.x,
            frame.y + frame.height - 34
        );

        c.lineTo(
            frame.x + frame.width,
            frame.y + frame.height - 34
        );

        c.stroke();

        // Header title

        const headerSize = Math.max(
            14,
            Math.min(23, canvas.width * 0.016)
        );

        c.fillStyle = '#008F46';
        c.font = `${headerSize}px "VT323", monospace`;
        c.textBaseline = 'middle';
        c.textAlign = 'left';

        c.fillText(
            'ZIX-OS // ASCII CAMERA',
            frame.x + 20,
            frame.y + 23
        );

        // Header status

        c.textAlign = 'right';
        c.fillStyle = '#008F46';

        c.fillText(
            '● LIVE',
            frame.x + frame.width - 20,
            frame.y + 23
        );

        // Footer

        c.font = '16px "VT323", monospace';
        c.textAlign = 'left';

        c.fillStyle = '#008F46';

        c.fillText(
            '1 ASCII  2 BINARY  3 BLOCKS  4 GREEN  5 RGB',
            frame.x + 20,
            frame.y + frame.height - 17
        );

        c.textAlign = 'right';

        c.fillText(
            'ESC TO EXIT',
            frame.x + frame.width - 20,
            frame.y + frame.height - 17
        );

        c.textAlign = 'left';
        c.textBaseline = 'top';
    };

    // Render camera frames.

    const drawFrame = () => {
        animationId = null;

        if (!running || !video)
            return;

        if (
            video.readyState < 2 ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            scheduleFrame();
            return;
        }

        try {
            if (
                !gridReady ||
                canvas.width !== lastCanvasWidth ||
                canvas.height !== lastCanvasHeight
            ) {
                if (!setGrid()) {
                    scheduleFrame();
                    return;
                }
            }

            drawingContext.drawImage(
                video,
                0,
                0,
                cols,
                rows
            );

            const frame = drawingContext.getImageData(
                0,
                0,
                cols,
                rows
            ).data;

            drawFrameChrome();

            // Keep all ASCII characters inside the frame.

            c.save();

            c.beginPath();

            c.rect(
                innerX,
                innerY,
                innerWidth,
                innerHeight
            );

            c.clip();

            c.font = fontSize + 'px monospace';
            c.textAlign = 'left';
            c.textBaseline = 'top';

            if (color === colorSets.green) {

                c.fillStyle = color;

                for (let i = 0; i < rows; i++) {
                    let values = '';

                    for (let j = 0; j < cols; j++) {
                        const brightness = getBrightness(
                            cols - 1 - j,
                            i,
                            frame
                        );

                        values += chars[
                            Math.floor(
                                brightness * (chars.length - 1)
                            )
                        ];
                    }

                    c.fillText(
                        values,
                        offsetX,
                        offsetY + i * fontSize
                    );
                }

            } else {

                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {

                        const sourceX = cols - 1 - j;

                        const brightness = getBrightness(
                            sourceX,
                            i,
                            frame
                        );

                        const character = chars[
                            Math.floor(
                                brightness * (chars.length - 1)
                            )
                        ];

                        c.fillStyle = getColor(
                            sourceX,
                            i,
                            frame
                        );

                        c.fillText(
                            character,
                            offsetX + j * fontSize * 0.6,
                            offsetY + i * fontSize
                        );
                    }
                }
            }

            c.restore();

        } catch (error) {
            console.error(
                'ASCII Camera rendering error:',
                error
            );

            stop();
            drawMessage('CAMERA RENDERING ERROR');

            return;
        }

        scheduleFrame();
    };

    const scheduleFrame = () => {
        if (running && animationId === null) {
            animationId = requestAnimationFrame(drawFrame);
        }
    };

    // Release camera and rendering resources.

    const releaseCamera = () => {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        if (video) {
            video.pause();
            video.srcObject = null;
            video = null;
        }

        drawingCanvas = null;
        drawingContext = null;

        gridReady = false;
        rows = 0;
    };

    // Start camera.

    const start = async (passedCanvas) => {
        if (running || starting)
            return;

        if (
            !passedCanvas ||
            typeof passedCanvas.getContext !== 'function'
        ) {
            return;
        }

        canvas = passedCanvas;
        c = canvas.getContext('2d');

        if (!c)
            return;

        starting = true;
        running = false;

        const currentSession = ++sessionId;

        drawMessage('REQUESTING CAMERA ACCESS...');

        if (
            !navigator.mediaDevices ||
            typeof navigator.mediaDevices.getUserMedia !== 'function'
        ) {
            starting = false;

            drawMessage(
                'CAMERA NOT SUPPORTED',
                'USE HTTPS OR LOCALHOST'
            );

            return;
        }

        video = document.createElement('video');

        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        try {
            const newStream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });

            if (currentSession !== sessionId) {
                newStream.getTracks().forEach(track => track.stop());
                return;
            }

            stream = newStream;
            video.srcObject = stream;

            await video.play();

            if (currentSession !== sessionId) {
                releaseCamera();
                return;
            }

            drawingCanvas = document.createElement('canvas');

            drawingContext = drawingCanvas.getContext('2d', {
                willReadFrequently: true
            });

            if (!drawingContext) {
                throw new Error(
                    'Could not initialize drawing context'
                );
            }

            running = true;
            starting = false;

            setGrid();
            drawFrame();

        } catch (error) {
            if (currentSession !== sessionId)
                return;

            starting = false;
            running = false;

            releaseCamera();

            console.error(
                'ASCII Camera error:',
                error.name,
                error.message
            );

            if (
                error.name === 'NotAllowedError' ||
                error.name === 'PermissionDeniedError'
            ) {
                drawMessage('CAMERA PERMISSION DENIED');

            } else if (error.name === 'NotFoundError') {
                drawMessage('NO CAMERA FOUND');

            } else if (error.name === 'NotReadableError') {
                drawMessage('CAMERA IS ALREADY IN USE');

            } else {
                drawMessage(
                    'CAMERA ERROR',
                    error.name || 'UNKNOWN ERROR'
                );
            }
        }
    };

    // Keyboard controls.

    const onKey = (eventType, key) => {
        if (eventType !== 'keydown')
            return;

        if (key === 'Escape') {
            stop();
            return;
        }

        if (!running)
            return;

        if (key === '1') {
            chars = charSets.ascii;

        } else if (key === '2') {
            chars = charSets.binary;

        } else if (key === '3') {
            chars = charSets.blocks;

        } else if (key === '4') {
            color = colorSets.green;

        } else if (key === '5') {
            color = colorSets.realColor;

        } else if (key === '+' || key === '=') {
            cols = Math.min(
                MAX_COLS,
                cols + COLS_STEP
            );

            setGrid();

        } else if (key === '-') {
            cols = Math.max(
                MIN_COLS,
                cols - COLS_STEP
            );

            setGrid();
        }
    };

    // Stop camera without clearing the terminal canvas.
    // main.js handles restoring the terminal with render().

    const stop = () => {
        sessionId++;

        running = false;
        starting = false;

        releaseCamera();
    };

    return {
        start,
        onKey,
        stop
    };
})();

export { camera };
