    const URL = "https://teachablemachine.withgoogle.com/models/AkJkVuCLm/";
    let model, webcam, ctx, labelContainer, maxPredictions;
    
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const size = 200;
        const flip = true; // whether to flip the webcam
        webcam = new tmPose.Webcam(size, size, flip); 
        await webcam.setup(); 
        await webcam.play();
        window.requestAnimationFrame(loop);

        const canvas = document.getElementById("canvas");
        canvas.width = size; canvas.height = size;
        ctx = canvas.getContext("2d");
        labelContainer = document.getElementById("container");
        for (let i = 0; i < maxPredictions; i++) { 
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop(timestamp) {
        webcam.update(); 
        await predict();
        window.requestAnimationFrame(loop);
    }

    async function predict() {
        
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        const prediction = await model.predict(posenetOutput);

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
            
            color(classPrediction);

        drawPose(pose);
        }
    }
    
    async function color(classPrediction){
        
        if (classPrediction == "Triangle pose: 1.00" || classPrediction == "Triangle pose: 0.99" || classPrediction == "Triangle pose: 0.98" || classPrediction == "Triangle pose: 0.97"){
            console.log('Triangle pose');
            labelContainer.classList.add('green');
            await new Promise(resolve => setTimeout(resolve, 3000));
            labelContainer.classList.remove('green');
        }
    }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }