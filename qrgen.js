function generateQRCode() {
    const userInput = document.getElementById("input_text").value;
    
    // Clear previous QR code
    document.getElementById("qrcode").innerHTML = "";
    
    // Generate new QR code
    new QRCode(document.getElementById("qrcode"), {
        text: userInput,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}