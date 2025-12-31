resource "aws_lambda_function" "chatbot" {
    function_name = "chatbot_function"       # This is the actual name of your Lambda in AWS. You’ll see it in the Lambda console.
    role          = aws_iam_role.lambda_exec.arn   # The IAM role Lambda assumes to get permissions. It allows your Lambda to log to CloudWatch, read/write resources, etc.
    handler       = "chatbot.handler"        # Tells Lambda which JS file and function to run. Format: <filename>.<exported_function_name>. Here, chatbot.js exports 'handler'.
    runtime       = "nodejs18.x"             # The Node.js version Lambda will use. Must match your JS code features.
    filename      = "D:/AWS-Resume-Challenge/lambda/chatbot.zip"  # Path to the zip of your Lambda code. Terraform uploads this to AWS.
    memory_size   = 128                       # Amount of RAM allocated to Lambda. Affects speed & slightly affects cost. 128MB is enough for small chatbot.
    timeout       = 10                        # Max seconds Lambda is allowed to run per request. If it takes longer, AWS stops it.

    environment {                             # Optional: key/value pairs available inside your Lambda code
        variables = {
            ENV_VAR_1 = "value1"              # Example environment variable. Can be used for API keys, configs, etc.
            ENV_VAR_2 = "value2"              # Another example variable.
        }
    }

    tags = {                                  # Optional metadata for organization & billing
        Name        = "chatbot_function"     # Tag identifying the Lambda by name
        Environment = "production"           # Tag identifying the environment (prod, dev, staging)
    }  
}

# IAM role for the lambda
resource "aws_iam_role" "lambda_exec" {
    name = "chatbot-lambda-role"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "lambda.amazonaws.com"
                }
            }
        ]
    })
  
}

# attach basic lambda permissions 
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}