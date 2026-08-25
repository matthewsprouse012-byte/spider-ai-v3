console.log("SPIDER-AI V3 APP LOADED");


window.App = {

    running: false,

    stream: null,

    fpsFrames: 0,

    fpsLastTime: 0,

    animationFrame: null,


    // ==========================================
    // INITIALIZE
    // ==========================================

    initialize() {

        console.log(
            "V3: INITIALIZING"
        );


        const button =
            document.getElementById(
                "startButton"
            );


        if (!button) {

            console.error(
                "V3: START BUTTON NOT FOUND"
            );

            return;

        }


        button.addEventListener(
            "click",
            () => {

                console.log(
                    "V3: START BUTTON PRESSED"
                );


                if (this.running) {

                    this.stop();

                } else {

                    this.start();

                }

            }
        );


        this.updateBattery();

        this.setupOrientation();

        this.setStatus(
            "SYSTEM READY"
        );


        console.log(
            "V3: READY"
        );

    },


    // ==========================================
    // START
    // ==========================================

    async start() {

        const button =
            document.getElementById(
                "startButton"
            );


        const camera =
            document.getElementById(
                "camera"
            );


        try {

            button.disabled = true;

            button.textContent =
                "STARTING...";


            this.setStatus(
                "STARTING CAMERA"
            );


            // CAMERA

            this.stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            facingMode: {
                                ideal: "environment"
                            },

                            width: {
                                ideal: 1280
                            },

                            height: {
                                ideal: 720
                            }

                        },

                        audio: false

                    });


            camera.srcObject =
                this.stream;


            await camera.play();


            console.log(
                "V3: CAMERA ONLINE"
            );


            document.getElementById(
                "cameraStatus"
            ).textContent =
                "ON";


            document.getElementById(
                "systemStatus"
            ).textContent =
                "ONLINE";


            this.setStatus(
                "LOADING OBJECT DETECTION"
            );


            // AI MODEL

            if (!window.Vision) {

                throw new Error(
                    "vision.js failed to load"
                );

            }


            const started =
                await Vision.start(
                    camera
                );


            if (!started) {

                throw new Error(
                    "Object detection failed to start"
                );

            }


            // ACTIVE

            this.running = true;


            document.getElementById(
                "mode"
            ).textContent =
                "OBJECT SCAN";


            button.disabled = false;

            button.textContent =
                "STOP SPIDER-AI";


            button.classList.add(
                "running"
            );


            this.setStatus(
                "SCANNING OBJECTS"
            );


            this.startFPS();


            console.log(
                "SPIDER-AI V3 ACTIVE"
            );


        } catch (error) {

            console.error(
                "V3 START ERROR:",
                error
            );


            this.running = false;


            if (this.stream) {

                this.stream
                    .getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );

                this.stream = null;

            }


            camera.srcObject =
                null;


            button.disabled = false;

            button.textContent =
                "START SPIDER-AI";


            this.setStatus(
                "START FAILED"
            );

        }

    },


    // ==========================================
    // STOP
    // ==========================================

    stop() {

        console.log(
            "V3: STOPPING"
        );


        this.running = false;


        if (window.Vision) {

            Vision.stop();

        }


        if (this.stream) {

            this.stream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

            this.stream = null;

        }


        const camera =
            document.getElementById(
                "camera"
            );


        camera.srcObject =
            null;


        document.getElementById(
            "cameraStatus"
        ).textContent =
            "OFF";


        document.getElementById(
            "systemStatus"
        ).textContent =
            "OFFLINE";


        document.getElementById(
            "tracking"
        ).textContent =
            "OFF";


        document.getElementById(
            "mode"
        ).textContent =
            "BASIC";


        const button =
            document.getElementById(
                "startButton"
            );


        button.disabled = false;

        button.textContent =
            "START SPIDER-AI";


        button.classList.remove(
            "running"
        );


        this.setStatus(
            "SYSTEM READY"
        );

    },


    // ==========================================
    // FPS
    // ==========================================

    startFPS() {

        this.fpsFrames = 0;

        this.fpsLastTime =
            performance.now();


        const loop =
            (time) => {

                if (!this.running) {
                    return;
                }


                this.fpsFrames++;


                const elapsed =
                    time -
                    this.fpsLastTime;


                if (elapsed >= 1000) {

                    const fps =
                        Math.round(
                            this.fpsFrames *
                            1000 /
                            elapsed
                        );


                    document.getElementById(
                        "fps"
                    ).textContent =
                        fps;


                    this.fpsFrames = 0;

                    this.fpsLastTime =
                        time;

                }


                this.animationFrame =
                    requestAnimationFrame(
                        loop
                    );

            };


        this.animationFrame =
            requestAnimationFrame(
                loop
            );

    },


    // ==========================================
    // BATTERY
    // ==========================================

    async updateBattery() {

        const element =
            document.getElementById(
                "battery"
            );


        if (
            !navigator.getBattery
        ) {

            element.textContent =
                "--";

            return;

        }


        try {

            const battery =
                await navigator.getBattery();


            const update =
                () => {

                    element.textContent =
                        Math.round(
                            battery.level * 100
                        ) +
                        "%";

                };


            update();


            battery.addEventListener(
                "levelchange",
                update
            );


        } catch {

            element.textContent =
                "--";

        }

    },


    // ==========================================
    // ORIENTATION
    // ==========================================

    setupOrientation() {

        if (
            !window.DeviceOrientationEvent
        ) {

            return;

        }


        window.addEventListener(
            "deviceorientation",
            event => {

                if (
                    event.alpha === null ||
                    event.alpha === undefined
                ) {

                    return;

                }


                document.getElementById(
                    "heading"
                ).textContent =
                    Math.round(
                        event.alpha
                    ) +
                    "°";

            }
        );

    },


    // ==========================================
    // STATUS
    // ==========================================

    setStatus(message) {

        const status =
            document.getElementById(
                "statusMessage"
            );


        if (status) {

            status.textContent =
                message;

        }

    }

};


// ==========================================
// PAGE READY
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "V3: DOM READY"
        );

        App.initialize();

    }
);
