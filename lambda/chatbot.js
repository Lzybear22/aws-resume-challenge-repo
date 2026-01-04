exports.handler = async (event) => {

    // Handle preflight OPTIONS request (sent automatically by browsers)
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: {
                // AWS Function URL will also add CORS headers, this is optional
                "Content-Type": "application/json"
            }
        };
    }

    console.log("Event received:", event);

    let userMessage = "";
    if (event.body) {
        try {
            const body = JSON.parse(event.body);
            userMessage = body.message || "";
        } catch (err) {
            console.error("Error parsing JSON:", err);
        }
    }

    // Basic chatbot logic
    let reply = "Sorry, I don't understand that yet.";
    const msg = userMessage.toLowerCase();

    if (msg.includes("resume")) {
        reply = "You can view my resume at: https://yourdomain.com/resume.pdf";
    } else if (msg.includes("skills")) {
        reply = "I work with AWS, Terraform, Python, DynamoDB, Lambda, API Gateway, and more!";
    } else if (msg.includes("projects")) {
        reply = "Check out my projects section on my website!";
    } else if (msg) {
        reply = "Echo: " + userMessage;
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
            // Remove Access-Control-Allow-Origin header — AWS will handle it
        },
        body: JSON.stringify({ reply })
    };
};