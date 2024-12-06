import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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






document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const carNumber = document.getElementById('car-number').value;
    const name = document.getElementById('name').value; // Get the name value

    console.log('Email:', email);
    console.log('Car Number:', carNumber);
    console.log('Name:', name); // Log the name

    // Save data to Firebase
    set(ref(database, 'users/' + carNumber), {
        email: email,
        carNumber: carNumber,
        name: name // Save the name
    }).then(() => {
        console.log('Data saved successfully!');
        window.location.href = "index.html";
        // Optionally redirect or show success message
    }).catch((error) => {
        console.error('Error saving data:', error);
        // Handle errors here
    });
});

