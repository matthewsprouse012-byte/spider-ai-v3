console.log("SPIDER-AI V3 APP LOADED");


const App = {

    running: false,

    stream: null,

    animationFrame: null,

    lastFrameTime: 0,

    frameCount: 0,

    fpsTime: 0,


    // ==========================================
    // INITIALIZE
    // ==========================================

    initialize() {

        console.log(
            "V3: initializing"
        );


        const button =
            document.getElementById(
                "startButton"
            );


        if (!button) {

            console.error(
                "V3: start button missing"
            );

            return;

        }


        button.addEventListener(
            "click",
            () => {

                console.log(
                    "V3: button pressed"
                );


                if (this.running) {

                    this.stop();

                } else {

                    this.start();

                }

            }
        );


        this.updateBattery();

        this.updateHeading();

        this.setStatus(
            "SYSTEM READY"
        );


        console.log(
            "V3: ready"
        );

    },


    // ==========================================
    // START
    // ==========================================

    async start() {

        console.log(
            "V3: starting"
        );


        const button =
            document.getElementById(
                "startButton"
            );


        try {

            button.disabled = true;

            button.textContent =
                "STARTING...";


            this.setStatus(
                "REQUESTING CAMERA"
            );


            // --------------------------------------
            // CAMERA
            // --------------------------------------

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "Camera API unavailable"
                );

            }


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


            const video =
                document.getElementById(
                    "camera"
                );


            video.srcObject =
                this.stream;


            await video.play();


            console.log(
                "V3: camera online"
            );


            document.getElementById(
                "cameraStatus"
            ).textContent =
                "ON";


            document.getElementById(
                "systemStatus"
            ).textContent =
                "ONLINE";


            document.getElementById(
                "tracking"
            ).textContent =
                "READY";


            this.setStatus(
                "CAMERA ONLINE"
            );


            button.textContent =
                "STOP SPIDER-AI";


            button.classList.add(
                "running"
            );


            this.running = true;

            button.disabled = false;


            this.startPerformanceLoop();


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


            button.disabled = false;

            button.textContent =
                "START SPIDER-AI";


            this.setStatus(
                "CAMERA FAILED"
            );

        }

    },


    // ==========================================
    // STOP
    // ==========================================

    stop() {

        console.log(
            "V3: stopping"
        );


        this.running = false;


        if (this.animationFrame) {

            cancelAnimationFrame(
                this.animationFrame
            );

            this.animationFrame = null;

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


        const video =
            document.getElementById(
                "camera"
            );


        video.srcObject = null;


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

    startPerformanceLoop() {

        this.frameCount = 0;

        this.fpsTime =
            performance.now();


        const loop =
            (time) => {

                if (!this.running) {
                    return;
                }


                this.frameCount++;


                const elapsed =
                    time -
                    this.fpsTime;


                if (elapsed >= 1000) {

                    const fps =
                        Math.round(
                            (
                                this.frameCount *
                                1000
                            ) /
                            elapsed
                        );


                    document.getElementById(
                        "fps"
                    ).textContent =
                        fps;


                    this.frameCount = 0;

                    this.fpsTime =
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
                        ) + "%";

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
    // HEADING
    // ==========================================

    updateHeading() {

        const element =
            document.getElementById(
                "heading"
            );


        if (
            !window.DeviceOrientationEvent
        ) {

            element.textContent =
                "--";

            return;

        }


        window.addEventListener(
            "deviceorientation",
            (event) => {

                let heading =
                    event.alpha;


                if (
                    heading === null ||
                    heading === undefined
                ) {

                    element.textContent =
                        "--";

                    return;

                }


                heading =
                    Math.round(
                        heading
                    );


                element.textContent =
                    heading + "°";

            }
        );

    },


    // ==========================================
    // STATUS
    // ==========================================

    setStatus(message) {

        const element =
            document.getElementById(
                "statusMessage"
            );


        if (element) {

            element.textContent =
                message;

        }


        const center =
            document.getElementById(
                "centerMessage"
            );


        if (center) {

            center.textContent =
                message;

        }

    }

};


// ==========================================
// START APP
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
