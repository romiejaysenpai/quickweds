import fetch from 'node-fetch'; // We can use global fetch in Node 18+

async function run() {
    const payload = {
        weddingId: "00000000-0000-0000-0000-000000000000", // Needs a real wedding ID, maybe fetch one?
        guestName: "Resend Tester",
        guestEmail: "test-rsvp@example.com",
        attendance: "Yes",
        numGuests: 2,
        message: "Can't wait!",
        dietaryDetails: "",
        songRequest: "Dancing Queen",
        plusOneNames: "Jane Doe",
        childrenCount: 0
    };

    console.log("Sending RSVP notify request...");
    try {
        const response = await fetch("http://localhost:3000/api/rsvp-notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Fetch Exception:", e);
    }
}

run();
