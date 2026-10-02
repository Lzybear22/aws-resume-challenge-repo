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
    reply = 'I work with AWS, Terraform, DynamoDB, Lambda, API Gateway, S3, CloudFront, JavaScript';
  } else if (msg.includes('projects')) {
    reply = 'Check out my projects section on my website!';

  } else if (msg === 'email' || msg === 'contact' || msg === 'contact me') {
    reply = 'You can reach me here: <a href="mailto:hulrich123@icloud.com?subject=Portfolio Contact" target="_blank">Send me an email</a>';

  } else if (msg) {
    reply = 'Echo: ' + userMessage;
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply })
  };
};
