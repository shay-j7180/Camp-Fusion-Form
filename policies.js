// Array of field names you want to collect for each registrant
const keys = [
  'firstName', 'lastName', 'dob', 'email', 'phone',
  'address', 'parentName', 'emergencyContactName', 'emergencyContactPhone',
  'allergies', 'allergyDetails', 'accommodations',
  'stayingPlace', 'stayingWith', 'bedsNeeded', 'roommates',
  'vbs', 'vbsDetails', 'otherNotes'
];

// Get the form element
const form = document.getElementById('policyForm');

// Add any stored values as hidden fields (so they're included with FormData)
keys.forEach(key => {
  const val = localStorage.getItem(key);
  if (val !== null) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = val;
    form.appendChild(input);
  }
});

// Handle form submission
form.addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent normal form submission!

  // Collect all form data
  const formData = new FormData(form);
  let person = {};
  keys.forEach(key => person[key] = formData.get(key) || "");
  person.agreePolicy = formData.get("agreePolicy") ? "on" : "";
  person.signature = formData.get("signature") || "";
  person.dateCompleted = formData.get("dateCompleted") || "";

  // Add this person to the array of registrants
  let registrants = JSON.parse(localStorage.getItem('registrants') || '[]');
  registrants.push(person);
  localStorage.setItem('registrants', JSON.stringify(registrants));

  // Clear person-specific info from localStorage for next registrant
  keys.concat(["agreePolicy", "signature", "dateCompleted"]).forEach(k => localStorage.removeItem(k));

  // Show custom modal for Yes/No choice
  document.getElementById('registerModal').style.display = 'flex';
});

// Attach modal button listeners ONCE (outside the submit handler)
document.getElementById('yesBtn').onclick = function() {
  document.getElementById('registerModal').style.display = 'none';
  window.location.href = "index.html"; // Redirect to index page
};

document.getElementById('noBtn').onclick = function() {
  document.getElementById('registerModal').style.display = 'none';
  // Get registrants from localStorage

  // ---- CORS-FIX: Use FormData instead of JSON ----
  let registrants = JSON.parse(localStorage.getItem('registrants') || '[]');
  const fd = new FormData();
  fd.append("registrants", JSON.stringify(registrants));
  fetch("https://script.google.com/macros/s/AKfycbzhRzgHnATpwgKkkdsQPw2Pn4DRHO0Snh1B4K0NTRo0GXM8_KC0eHt0wNqtQSk9iVMY/exec", {
    method: "POST",
    body: fd
    // No headers! Don't set Content-Type, browser will set it for FormData.
  }).then(response => {
    if (response.ok) {
      alert("Registration complete!");
      localStorage.removeItem('registrants');
      form.reset();
      window.location.href = "thankyou.html";
    } else {
      alert("There was a problem submitting your registration.");
    }
  }).catch((err) => {
    console.log("Fetch error:", err);
    alert("There was a network error submitting your registration.");
  });
};