# Lambda execution role
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

# Attach basic execution policy (CloudWatch logs)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function
resource "aws_lambda_function" "chatbot" {
  function_name = "chatbot_function"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "chatbot.handler"
  runtime       = "nodejs20.x"
  filename      = "../lambda/chatbot.zip"
  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      ENV_VAR_1 = var.env_var_1
      ENV_VAR_2 = var.env_var_2
    }
  }

  tags = {
    Name        = "chatbot_function"
    Environment = "production"
  }

  depends_on = [aws_iam_role.lambda_exec]
}

# Permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chatbot.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.api_gateway_region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}/*/*"
}

# Get AWS account ID for source_arn
data "aws_caller_identity" "current" {}