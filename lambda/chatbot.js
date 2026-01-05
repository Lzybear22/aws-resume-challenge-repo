const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "us-west-2" }); // match your SES region

exports.handler = async (event) => {

    // Handle preflight OPTIONS request (CORS)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: { "Content-Type": "application/json" } };
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

    const msg = userMessage.toLowerCase().trim();
    let reply = "Sorry, I don't understand that yet.";

    // Basic responses
    if (msg === "" || msg === "hello" || msg === "hi") {
        reply = "Hello! Welcome to my chatbot! Type 'help' to see available commands.";
    } else if (msg === "help") {
        reply = `
Here are some commands you can try:
- 'resume' → Get a link to my resume
- 'skills' → See what technologies I work with
- 'projects' → Learn about my projects
- 'contact me' → Send a message via email
`;
    } else if (msg.includes("resume")) {
        reply = "You can view my resume at: https://yourdomain.com/resume.pdf";
    } else if (msg.includes("skills")) {
        reply = "I work with AWS, Terraform, Python, DynamoDB, Lambda, API Gateway, S3, CloudFront, JavaScript";
    } else if (msg.includes("projects")) {
        reply = "Check out my projects section on my website!";

    // Contact me
    } else if (msg.startsWith("contact me:")) {
        const parts = userMessage.split("|");
        if (parts.length === 2) {
            const senderEmail = parts[0].replace("contact me:", "").trim();
            const messageContent = parts[1].trim();

            const emailParams = {
                Destination: { ToAddresses: [process.env.CHATBOT_EMAIL] },
                Message: {
                     
                    Body: { Text: { Data: `From: ${senderEmail}\n\nMessage:\n${messageContent}` } },
                    Subject: { Data: "New message from chatbot" }
                },
                Source: process.env.CHATBOT_EMAIL
            };

            try {
                await ses.sendEmail(emailParams).promise();
                reply = "Your message was sent successfully! I’ll get back to you soon.";
            } catch (err) {
                console.error("Error sending email:", err);
                reply = "Oops! Something went wrong sending your message.";
            }
        } else {
            reply = "Please use this format:\ncontact me: yourname@example.com | Your message here";
        }

    // Fallback
    } else if (msg) {
        reply = "Echo: " + userMessage;
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply })
    };
};
