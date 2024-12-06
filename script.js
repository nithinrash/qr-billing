import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXUhmTot3crmMNKsuM-uWXWtSwRgkZXSc",
  authDomain: "smartparkingg-f7952.firebaseapp.com",
  databaseURL: "https://smartparkingg-f7952-default-rtdb.firebaseio.com",
  projectId: "smartparkingg-f7952",
  storageBucket: "smartparkingg-f7952.appspot.com",
  messagingSenderId: "935237553409",
  appId: "1:935237553409:web:ba7a7d8532a100bc09df00",
  measurementId: "G-RYT8KH7S5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch current time in Bangalore
async function fetchBangaloreTime() {
  try {
    const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Extract the time part from the datetime string
    const time = data.time; // Assuming the API returns a field named 'time' in 24-hour format

    // console.log('Current Time in Bangalore:', time);
    return time;
  } catch (error) {
    // console.error('Error fetching time:', error);
    return null;
  }
}
fetchBangaloreTime();

// Function to update the parking lot layout
function updateParkingLot(data) {
  const parkingLot = document.getElementById('parking-lot');
  parkingLot.innerHTML = ''; // Clear existing slots

  Object.keys(data.sensors).forEach((sensor, index) => {
    const slotButton = document.createElement('button');
    slotButton.className = 'slot';

    const bookingKey = `book${index + 1}`;
    const isBooked = data.bookings[bookingKey] === 0;

    if (data.sensors[sensor] === 1 && !isBooked) {
      // Show label only if the slot is empty and not booked
      const slotLabel = `P${index + 1}`;
      slotButton.textContent = slotLabel;
      slotButton.classList.add('empty'); // No blinking effect
   // Function to book a parking slot
slotButton.onclick = async () => {
  const name = document.getElementById('name').value;
  const carNumber = document.getElementById('car-number').value;
  const email = document.getElementById('email').value;
  const confirmBooking = confirm(`Do you want to book Slot ${slotLabel}?`);
  
  if (confirmBooking) {
      // Fetch current time for booking
      const currentTime = await fetchBangaloreTime();

      // Replace '.' with '_' in email to use as a Firebase key
      const sanitizedEmail = email.replace(/\./g, '_');

      // Update Firebase to mark the slot as booked
      const bookingRef = ref(database, `bookings/${bookingKey}`);
      set(ref(database, 'elmalid/'), {
        email: carNumber,
        
    })
      set(ref(database, 'users/' + carNumber), {
          email: email,
          carNumber: carNumber,
          name: name,
          slotBooked: bookingKey,
          sensorvalue:sensor,
          slotnumber: slotLabel,
          inTime: currentTime
      }).then(() => {
          console.log(email)
          console.log('Data saved successfully!');
      }).catch((error) => {
          console.error('Error saving data:', error);
      });

      set(bookingRef, 0)
          .then(() => {
              alert(`Slot ${slotLabel} has been booked!`);
              // Schedule to make the slot empty after 30 seconds
              setTimeout(() => {
                  set(bookingRef, 1)
                      .then(() => console.log(`Slot ${slotLabel} is now available.`))
                      .catch(error => console.error("Error updating database: ", error));
              }, 30000); // 30000 milliseconds = 30 seconds
          })
          .catch(error => console.error("Error updating database: ", error));
  }
};

    } else if (isBooked) {
      // Mark the slot as booked with a transparent yellow color
      const slotLabel = `P${index + 1} (Booked)`;
      slotButton.textContent = slotLabel;
      slotButton.classList.add('booked');
      slotButton.disabled = true; // Disable button since it's booked
    } else if (data.sensors[sensor] === 0) {

     // console.log(sensor)
      updateSensorTime(sensor);  


      // If sensor value is 0, update booking status to available
      const bookingRef = ref(database, `bookings/${bookingKey}`);
      
      set(bookingRef, 1)
        .catch(error => console.error("Error updating database: ", error));
      
      const carImg = document.createElement('img');
      carImg.src = 'images/car.png'; // Ensure this path is correct
      carImg.alt = 'Car';
      carImg.className = 'car-image';
      slotButton.appendChild(carImg);
      slotButton.disabled = true; // Disable button if the slot is occupied
    }

    parkingLot.appendChild(slotButton);
  });
}

// Listen for changes in the database
const databaseRef = ref(database);
onValue(databaseRef, snapshot => {
  const data = snapshot.val();
  console.log(data); // Log all values from Firebase
  updateParkingLot(data);
});

// Event listener for form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const carNumber = document.getElementById('car-number').value;
  const name = document.getElementById('name').value;

  console.log('Email:', email);
  console.log('Car Number:', carNumber);
  console.log('Name:', name);

});


async function updateSensorTime(sensorId) {
  try {
    // Validate sensor input
    if (!sensorId || typeof sensorId !== 'string') {
      throw new Error('Invalid sensor ID');
    }

    // Fetch current time in Bangalore
    const currentTime = await fetchBangaloreTime();

    // Create dynamic reference for specific sensor time
    const timeRef = ref(database, `times/${sensorId}`);

    // Update time for specific sensor
    await set(timeRef, currentTime);

    //console.log(`Time updated for ${sensorId}: ${currentTime}`);
    return currentTime;

  } catch (error) {
    //console.error(`Error updating time for ${sensorId}:`, error);
    return null;
  }
}
// Function to update sensor states in Firebase
async function updateSensorStates(sensorStates) {
  try {
    // Reference to sensors in Firebase
    const sensorsRef = ref(database, 'sensors');

    // Update sensor states
    await set(sensorsRef, {
      sensor1: sensorStates.sensor1,
      sensor2: sensorStates.sensor2,
      sensor3: sensorStates.sensor3,
      sensor4: sensorStates.sensor4
    });

    console.log('Sensor states updated successfully:', sensorStates);
  } catch (error) {
    console.error('Error updating sensor states:', error);
  }
}

// Alternative dynamic implementation
async function updateSensorStatesAdvanced(sensorStates) {
  try {
    const sensorsRef = ref(database, 'sensors');
    
    await set(sensorsRef, sensorStates);

    console.log('Sensor states updated successfully:', sensorStates);
  } catch (error) {
    console.error('Error updating sensor states:', error);
  }
}

// Usage Examples
// const sensorData = {
//   sensor1: 1,
//   sensor2: 1,
//   sensor3: 1,
//   sensor4: 1
// };

// updateSensorStates(sensorData);
// // or
// updateSensorStatesAdvanced(sensorData);

// // Usage Examples
