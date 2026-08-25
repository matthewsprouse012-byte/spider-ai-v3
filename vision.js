console.log("SPIDER-AI V3 VISION LOADED");


window.Vision = {

    model: null,

    running: false,

    detecting: false,

    video: null,

    box: null,


    // ==========================================
    // LOAD MODEL
    // ==========================================

    async loadModel() {

        console.log(
            "VISION: loading object model..."
        );


        if (!window.cocoSsd) {

            console.error(
                "VISION: COCO-SSD unavailable"
            );

            return false;

        }


        try {

            this.model =
                await cocoSsd.load();


            console.log(
                "VISION: MODEL READY"
            );


            return true;

        } catch (error) {

            console.error(
                "VISION: MODEL ERROR",
                error
            );

            return false;

        }

    },


    // ==========================================
    // START
    // ==========================================

    async start(video) {

        this.video =
            video ||
            document.getElementById(
                "camera"
            );


        if (!this.video) {

            console.error(
                "VISION: camera missing"
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


        console.log(
            "VISION: SCANNING"
        );


        this.scan();


        return true;

    },


    // ==========================================
    // SCAN
    // ==========================================

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
                    0.35
                );


            this.handlePredictions(
                predictions
            );


        } catch (error) {

            console.error(
                "VISION: scan error",
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
    // PROCESS OBJECTS
    // ==========================================

    handlePredictions(
        predictions
    ) {

        if (
            !predictions ||
            predictions.length === 0
        ) {

            this.clearTarget();

            return;

        }


        predictions.sort(
            (a, b) =>
                b.score - a.score
        );


        const target =
            predictions[0];


        const name =
            target.class;


        const confidence =
            Math.round(
                target.score * 100
            );


        console.log(
            "TARGET:",
            name,
            confidence + "%"
        );


        // MAIN OBJECT NAME

        const nameElement =
            document.getElementById(
                "objectName"
            );


        const confidenceElement =
            document.getElementById(
                "objectConfidence"
            );


        const trackingElement =
            document.getElementById(
                "tracking"
            );


        const statusElement =
            document.getElementById(
                "statusMessage"
            );


        if (nameElement) {

            nameElement.textContent =
                name.toUpperCase();

        }


        if (confidenceElement) {

            confidenceElement.textContent =
                confidence +
                "% CONFIDENCE";

        }


        if (trackingElement) {

            trackingElement.textContent =
                "LOCKED";

        }


        if (statusElement) {

            statusElement.textContent =
                "TARGET: " +
                name.toUpperCase();

        }


        this.drawBox(
            target
        );

    },


    // ==========================================
    // DRAW BOX
    // ==========================================

    drawBox(
        prediction
    ) {

        const video =
            this.video;


        if (
            !video ||
            !video.videoWidth ||
            !video.videoHeight
        ) {

            return;

        }


        if (!this.box) {

            this.box =
                document.createElement(
                    "div"
                );


            this.box.className =
                "detection-box";


            this.box.innerHTML =
                `
                <div class="detection-label">
                </div>
                `;


            document.body.appendChild(
                this.box
            );

        }


        const videoRatio =
            video.videoWidth /
            video.videoHeight;


        const screenRatio =
            window.innerWidth /
            window.innerHeight;


        let scale;

        let offsetX = 0;
        let offsetY = 0;


        if (
            videoRatio >
            screenRatio
        ) {

            scale =
                window.innerHeight /
                video.videoHeight;


            const displayedWidth =
                video.videoWidth *
                scale;


            offsetX =
                (
                    window.innerWidth -
                    displayedWidth
                ) / 2;

        } else {

            scale =
                window.innerWidth /
                video.videoWidth;


            const displayedHeight =
                video.videoHeight *
                scale;


            offsetY =
                (
                    window.innerHeight -
                    displayedHeight
                ) / 2;

        }


        const x =
            prediction.bbox[0] *
            scale +
            offsetX;


        const y =
            prediction.bbox[1] *
            scale +
            offsetY;


        const width =
            prediction.bbox[2] *
            scale;


        const height =
            prediction.bbox[3] *
            scale;


        this.box.style.left =
            x + "px";


        this.box.style.top =
            y + "px";


        this.box.style.width =
            width + "px";


        this.box.style.height =
            height + "px";


        this.box.style.display =
            "block";


        const label =
            this.box.querySelector(
                ".detection-label"
            );


        if (label) {

            label.textContent =
                prediction.class
                    .toUpperCase() +
                " " +
                Math.round(
                    prediction.score * 100
                ) +
                "%";

        }

    },


    // ==========================================
    // CLEAR
    // ==========================================

    clearTarget() {

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


        const status =
            document.getElementById(
                "statusMessage"
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


        if (status) {
            status.textContent =
                "SCANNING";
        }


        if (this.box) {

            this.box.style.display =
                "none";

        }

    },


    // ==========================================
    // STOP
    // ==========================================

    stop() {

        console.log(
            "VISION: STOPPED"
        );


        this.running = false;

        this.detecting = false;


        if (this.box) {

            this.box.style.display =
                "none";

        }


        this.clearTarget();

    }

};
