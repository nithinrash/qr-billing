function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

async function fetchBangaloreTime() {
    try {
        const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        const time = data.time;
        return time;
    } catch (error) {
        console.error('Error fetching time:', error);
        return null;
    }
}

function compareTimes(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    let differenceInMinutes = totalMinutes2 - totalMinutes1;

    if (differenceInMinutes < 0) {
        differenceInMinutes += 24 * 60;
    }

    return differenceInMinutes;
}

function selectImageBasedOnTimeDifference(timeDifference) {
    if (timeDifference < 1) {
        return "20.jpeg";
    } else if (timeDifference < 2) {
        return "40.jpeg";
    } else if (timeDifference < 3) {
        return "60.jpeg";
    } else {
        return "100.jpeg";
    }
}

domReady(function () {
    // New functions for camera toggle
    function toggleCameraVisibility(showCamera) {
        const qrReaderElement = document.getElementById('my-qr-reader');
        const imageElement = document.getElementById('dynamic-image');
        
        if (showCamera) {
            qrReaderElement.style.display = 'block';
            if (imageElement) imageElement.style.display = 'none';
        } else {
            qrReaderElement.style.display = 'none';
            if (imageElement) imageElement.style.display = 'block';
        }
    }

    function resetScanProcess() {
        htmlscanner.clear().then(() => {
            htmlscanner.render(onScanSuccess);
            toggleCameraVisibility(true);
        }).catch(error => {
            console.error("Error resetting scanner:", error);
        });
    }

    function fetchDataFromFirebase(sensorValue) {
        const url = "https://smartparkingg-f7952-default-rtdb.firebaseio.com/times.json";

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(async data => {
                console.log("Times data:", data);
                
                if (data && sensorValue in data) {
                    console.log(`Value for ${sensorValue}:`, data[sensorValue]);
                    
                    const currentTime = await fetchBangaloreTime();
                    if (currentTime) {
                        console.log("Current Time in Bangalore:", currentTime);
                        const timeDifference = compareTimes(data[sensorValue], currentTime);
                        console.log(`Time Difference: ${timeDifference} minutes`);

                        const selectedImage = selectImageBasedOnTimeDifference(timeDifference);
                        console.log(`Selected Image: ${selectedImage}`);

                        // Hide camera, show image
                        toggleCameraVisibility(false);

                        let imgElement = document.getElementById('dynamic-image');
                        if (!imgElement) {
                            imgElement = document.createElement('img');
                            imgElement.id = 'dynamic-image';
                            document.body.appendChild(imgElement);
                        }
                        imgElement.src = `images/${selectedImage}`;
                        imgElement.alt = `Image for ${selectedImage}`;

                        // Automatically reset after 15 seconds
                        setTimeout(() => {
                            window.location.reload();
                        }, 15000);
                    }
                } else {
                    console.log(`Sensor value ${sensorValue} not found in data.`);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }

    function extractSensorValue(decodedText) {
        const match = decodedText.match(/'sensorvalue':\s*'([^']+)'/);
        return match ? match[1] : null;
    }

    function onScanSuccess(decodeText, decodeResult) {
        const qrCodeValue = decodeText;

        const sensorValue = extractSensorValue(decodeText);
        
        if (sensorValue) {
            console.log("Sensor Value:", sensorValue);
            fetchDataFromFirebase(sensorValue);
        } else {
            console.log("Sensor value not found in QR code.");
        }
    }

    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 }
    );
    htmlscanner.render(onScanSuccess);
});
