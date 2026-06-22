# Lambda execution role
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-chatbot-lambda-role"

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

  tags = local.common_tags
}

# Attach basic execution policy (CloudWatch logs)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function
resource "aws_lambda_function" "chatbot" {
  function_name    = "${var.project_name}-chatbot-function"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "chatbot.handler"
  runtime         = "nodejs20.x"
  filename        = "../lambda/chatbot.zip"
  source_code_hash = filebase64sha256("../lambda/chatbot.zip")
  memory_size     = 128
  timeout         = 10

  environment {
    variables = {
      ENV_VAR_1 = var.env_var_1
      ENV_VAR_2 = var.env_var_2
    }
  }

  tags = merge(local.common_tags, {
    Name = "chatbot-function"
  })

  depends_on = [aws_iam_role.lambda_exec]
}
