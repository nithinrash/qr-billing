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
        
        // Extract the time part from the datetime string
        const time = data.time; // Assuming the API returns a field named 'time' in 24-hour format
        return time;
    } catch (error) {
        console.error('Error fetching time:', error);
        return null;
    }
}

// Function to compare two times in HH:MM format
function compareTimes(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    // Convert both times to total minutes since midnight
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    // Calculate the difference in minutes
    let differenceInMinutes = totalMinutes2 - totalMinutes1;

    // If the difference is negative, adjust for a full day (24 hours)
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

    // Function to fetch data from Firebase Realtime Database
    function fetchDataFromFirebase(sensorValue) {
        const url = "https://smartparkingg-f7952-default-rtdb.firebaseio.com/times.json"; // Ensure .json at the end

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(async data => {
                console.log("Times data:", data); // Log the fetched data
                
                // Check if sensorValue exists in the fetched data
                if (data && sensorValue in data) {
                    console.log(`Value for ${sensorValue}:`, data[sensorValue]);
                    
                    // Fetch current Bangalore time
                    const currentTime = await fetchBangaloreTime();
                    if (currentTime) {
                        console.log("Current Time in Bangalore:", currentTime);
                        const timeDifference = compareTimes(data[sensorValue], currentTime);
                        console.log(`Time Difference: ${timeDifference} minutes`);

                        const selectedImage = selectImageBasedOnTimeDifference(timeDifference);
                        console.log(`Selected Image: ${selectedImage}`);

                        // Display the selected image in an HTML element
                        let imgElement = document.getElementById('dynamic-image');
                        if (!imgElement) {
                            imgElement = document.createElement('img');
                            imgElement.id = 'dynamic-image';
                            document.body.appendChild(imgElement);
                        }
                        imgElement.src = `images/${selectedImage}`; // Ensure the path is correct
                        imgElement.alt = `Image for ${selectedImage}`;

                        // Hide QR scanner and show image
                        let qrScannerElement = document.getElementById("my-qr-reader");
                        qrScannerElement.style.display = "none"; // Hide QR scanner

                        // Show QR scanner again after 30 seconds
                        setTimeout(() => {
                            qrScannerElement.style.display = "block"; // Show QR scanner
                            imgElement.remove(); // Remove the displayed image
                        }, 30000); // 30 seconds delay
                    }
                } else {
                    console.log(`Sensor value ${sensorValue} not found in data.`);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }

    // Function to extract sensorvalue from decoded text
    function extractSensorValue(decodedText) {
        // Use a regular expression to find the sensorvalue
        const match = decodedText.match(/'sensorvalue':\s*'([^']+)'/);
        return match ? match[1] : null;
    }

    // Function to handle successful QR code scans
    function onScanSuccess(decodeText, decodeResult) {
        const qrCodeValue = decodeText;  // Store the decoded text in the variable
        
        // Extract and log the sensorvalue
        const sensorValue = extractSensorValue(decodeText);
        
        if (sensorValue) {
            console.log("Sensor Value:", sensorValue);  // Log the extracted sensor value
            
            // Fetch data from Firebase and look for the sensor value
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