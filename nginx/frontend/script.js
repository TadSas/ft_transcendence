function authenticate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var errorMessage = document.getElementById("error-message");

    // Simple authentication check (replace with server-side validation)
    if (username === "user" && password === "password") {
        // Redirect to a success page or perform other actions
        alert("Authentication successful!");
    } else {
        errorMessage.innerHTML = "Invalid username or password.";
    }
}
