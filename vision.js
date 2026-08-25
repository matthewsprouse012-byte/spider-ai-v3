console.log("SPIDER-AI V3 TRACKING LOADED");

window.Vision = {

    model: null,
    running: false,
    detecting: false,
    video: null,

    targets: [],
    nextID: 1,

    async loadModel() {

        console.log("VISION: loading model...");

        if (!window.cocoSsd) {
            console.error("VISION: COCO-SSD NOT FOUND");
            return false;
        }

        try {

            this.model = await cocoSsd.load();

            console.log("VISION: MODEL READY");

            return true;

        } catch (error) {

            console.error(
                "VISION: MODEL LOAD FAILED",
                error
            );

            return false;
        }
    },


    async start(video) {

        this.video =
            video ||
            document.getElementById("camera");

        if (!this.video) {

            console.error(
                "VISION: CAMERA NOT FOUND"
            );

            return false;
        }

        if (!this.model) {

            const ready =
                await this.loadModel();

            if (!ready) {
                return false;
            }
        }

        this.running = true;
        this.targets = [];

        console.log(
            "VISION: TRACKING STARTED"
        );

        this.scan();

        return true;
    },


    async scan() {

        if (!this.running) {
            return;
        }

        if (
            !this.model ||
            !this.video ||
            this.video.readyState < 2
        ) {

            requestAnimationFrame(
                () => this.scan()
            );

            return;
        }

        if (this.detecting) {

            requestAnimationFrame(
                () => this.scan()
            );

            return;
        }

        this.detecting = true;

        try {

            const predictions =
                await this.model.detect(
                    this.video,
                    20,
                    0.40
                );

            this.updateTracking(
                predictions
            );

        } catch (error) {

            console.error(
                "VISION: DETECTION ERROR",
                error
            );

        }

        this.detecting = false;

        if (this.running) {

            requestAnimationFrame(
                () => this.scan()
            );

        }
    },


    // ==========================================
    // TRACK OBJECTS BETWEEN FRAMES
    // ==========================================

    updateTracking(predictions) {

        const newTargets = [];

        for (const prediction of predictions) {

            const box =
                prediction.bbox;

            const center = {

                x:
                    box[0] +
                    box[2] / 2,

                y:
                    box[1] +
                    box[3] / 2

            };


            let closest = null;

            let closestDistance =
                Infinity;


            for (const old of this.targets) {

                if (
                    old.name !==
                    prediction.class
                ) {
                    continue;
                }


                const dx =
                    center.x -
                    old.center.x;


                const dy =
                    center.y -
                    old.center.y;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;

                    closest =
                        old;

                }
            }


            let id;


            if (
                closest &&
                closestDistance < 150
            ) {

                id =
                    closest.id;

            } else {

                id =
                    this.nextID++;

            }


            newTargets.push({

                id: id,

                name:
                    prediction.class,

                confidence:
                    prediction.score,

                bbox: box,

                center: center,

                lastSeen:
                    Date.now()

            });

        }


        this.targets =
            newTargets;


        this.displayTargets();

    },


    // ==========================================
    // DISPLAY TRACKED OBJECTS
    // ==========================================

    displayTargets() {

        this.removeOldBoxes();


        if (
            this.targets.length === 0
        ) {

            this.setNoTarget();

            return;
        }


        const highest =
            this.targets
                .slice()
                .sort(
                    (a, b) =>
                        b.confidence -
                        a.confidence
                )[0];


        this.updateMainTarget(
            highest
        );


        for (
            const target
            of this.targets
        ) {

            this.drawTarget(
                target
            );

        }


        const tracking =
            document.getElementById(
                "tracking"
            );


        if (tracking) {

            tracking.textContent =
                this.targets.length +
                " LOCKED";

        }


        const status =
            document.getElementById(
                "statusMessage"
            );


        if (status) {

            status.textContent =
                this.targets.length +
                " OBJECT" +
                (
                    this.targets.length === 1
                        ? ""
                        : "S"
                ) +
                " TRACKED";

        }

    },


    // ==========================================
    // MAIN TARGET
    // ==========================================

    updateMainTarget(target) {

        const name =
            document.getElementById(
                "objectName"
            );


        const confidence =
            document.getElementById(
                "objectConfidence"
            );


        if (name) {

            name.textContent =
                target.name.toUpperCase();

        }


        if (confidence) {

            confidence.textContent =
                Math.round(
                    target.confidence * 100
                ) +
                "% CONFIDENCE";

        }

    },


    // ==========================================
    // DRAW TRACKING BOX
    // ==========================================

    drawTarget(target) {

        const video =
            this.video;


        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
        }


        let element =
            document.getElementById(
                "target-" +
                target.id
            );


        if (!element) {

            element =
                document.createElement(
                    "div"
                );


            element.id =
                "target-" +
                target.id;


            element.className =
                "tracking-box";


            element.innerHTML = `
                <div class="tracking-label"></div>
            `;


            document.body.appendChild(
                element
            );

        }


        const scale =
            Math.max(

                window.innerWidth /
                    video.videoWidth,

                window.innerHeight /
                    video.videoHeight

            );


        const displayWidth =
            video.videoWidth *
            scale;


        const displayHeight =
            video.videoHeight *
            scale;


        const offsetX =
            (
                window.innerWidth -
                displayWidth
            ) / 2;


        const offsetY =
            (
                window.innerHeight -
                displayHeight
            ) / 2;


        const x =
            target.bbox[0] *
            scale +
            offsetX;


        const y =
            target.bbox[1] *
            scale +
            offsetY;


        const width =
            target.bbox[2] *
            scale;


        const height =
            target.bbox[3] *
            scale;


        element.style.left =
            x + "px";


        element.style.top =
            y + "px";


        element.style.width =
            width + "px";


        element.style.height =
            height + "px";


        element.style.display =
            "block";


        const label =
            element.querySelector(
                ".tracking-label"
            );


        if (label) {

            label.textContent =
                "#" +
                target.id +
                " " +
                target.name.toUpperCase() +
                " " +
                Math.round(
                    target.confidence * 100
                ) +
                "%";

        }

    },


    // ==========================================
    // REMOVE OLD BOXES
    // ==========================================

    removeOldBoxes() {

        const boxes =
            document.querySelectorAll(
                ".tracking-box"
            );


        boxes.forEach(
            box => {

                const id =
                    box.id.replace(
                        "target-",
                        ""
                    );


                const exists =
                    this.targets.some(
                        target =>
                            String(
                                target.id
                            ) === id
                    );


                if (!exists) {

                    box.remove();

                }

            }
        );

    },


    // ==========================================
    // NO TARGET
    // ==========================================

    setNoTarget() {

        const name =
            document.getElementById(
                "objectName"
            );


        const confidence =
            document.getElementById(
                "objectConfidence"
            );


        const tracking =
            document.getElementById(
                "tracking"
            );


        if (name) {
            name.textContent =
                "NO TARGET";
        }


        if (confidence) {
            confidence.textContent =
                "--";
        }


        if (tracking) {
            tracking.textContent =
                "SEARCHING";
        }


        const status =
            document.getElementById(
                "statusMessage"
            );


        if (status) {
            status.textContent =
                "SCANNING";
        }

    },


    // ==========================================
    // STOP
    // ==========================================

    stop() {

        console.log(
            "VISION: TRACKING STOPPED"
        );


        this.running = false;

        this.detecting = false;

        this.targets = [];


        document
            .querySelectorAll(
                ".tracking-box"
            )
            .forEach(
                box =>
                    box.remove()
            );


        this.setNoTarget();

    }

};
