const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const ses = new SESClient({ region: 'us-east-1' });

exports.handler = async (event) => {

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Content-Type': 'application/json' } };
  }

  console.log('Event received:', event);

  let userMessage = '';
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      userMessage = body.message || '';
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  }

  const msg = userMessage.toLowerCase().trim();
  let reply = "Sorry, I don't understand that yet.";

  if (msg === '' || msg === 'hello' || msg === 'hi') {
    reply = "Hello! Welcome to my chatbot! Type 'help' to see available commands.";
  } else if (msg === 'help') {
    reply = `Here are some commands you can try:
- 'resume' → Get a link to my resume
- 'skills' → See what technologies I work with
- 'projects' → Learn about my projects
- 'contact me' → Send a message via email`;
  } else if (msg.includes('resume')) {
    reply = 'You can view my resume here: <a href="/resume.pdf" target="_blank">Open Resume</a>';
  } else if (msg.includes('skills')) {
    reply = 'I work with AWS, Terraform, Python, DynamoDB, Lambda, API Gateway, S3, CloudFront, JavaScript';
  } else if (msg.includes('projects')) {
    reply = 'Check out my projects section on my website!';

  } else if (msg.startsWith('contact me:')) {
    const parts = userMessage.split('|');
    if (parts.length === 2) {
      const senderEmail = parts[0].replace('contact me:', '').trim();
      const messageContent = parts[1].trim();

      try {
        await ses.send(new SendEmailCommand({
          Destination: { ToAddresses: [process.env.CHATBOT_EMAIL] },
          Message: {
            Body: { Text: { Data: `From: ${senderEmail}\n\nMessage:\n${messageContent}` } },
            Subject: { Data: 'New message from chatbot' }
          },
          Source: process.env.CHATBOT_EMAIL
        }));
        reply = "Your message was sent successfully! I'll get back to you soon.";
      } catch (err) {
        console.error('Error sending email:', err);
        reply = 'Oops! Something went wrong sending your message.';
      }
    } else {
      reply = 'Please use this format:\ncontact me: yourname@example.com | Your message here';
    }

  } else if (msg) {
    reply = 'Echo: ' + userMessage;
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply })
  };
};
