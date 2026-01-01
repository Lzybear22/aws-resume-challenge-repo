exports.handler = async (event) => {
    console.log("Event received:", event);

    let userMessage = "";

    // Parse POST body
    if (event.body) {
        const body = JSON.parse(event.body);
        userMessage = body.message || "";
    }

    // Basic response logic
    let reply = "Sorry, I don't understand that yet.";

    if (userMessage.toLowerCase().includes("resume")) {
        reply = "You can view my resume at: https://yourdomain.com/resume.pdf";
    } else if (userMessage.toLowerCase().includes("skills")) {
        reply = "I work with AWS, Terraform, Python, DynamoDB, Lambda, API Gateway, and more!";
    } else if (userMessage.toLowerCase().includes("projects")) {
        reply = "Check out my projects section on my website!";
    } else {
        reply = "Echo: " + userMessage;
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply })
    };
};
