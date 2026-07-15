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
resource "aws_iam_role" "visitor_lambda_exec" {
  name = "visitor-counter-lambda-role"

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
# Basic execution policy for visitor counter
resource "aws_iam_role_policy_attachment" "visitor_lambda_logs" {
  role       = aws_iam_role.visitor_lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB access policy for visitor counter
resource "aws_iam_role_policy" "visitor_lambda_dynamodb" {
  name = "visitor-lambda-dynamodb-policy"
  role = aws_iam_role.visitor_lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.visitor_counter.arn
      }
    ]
  })
}

# Package the visitor counter Lambda function
data "archive_file" "visitor_counter_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../visitor-counter"
  output_path = "${path.module}/../lambda/visitor-counter.zip"
  excludes    = ["node_modules", "package-lock.json", ".git"]
}

# Visitor Counter Lambda Function
resource "aws_lambda_function" "visitor_counter" {
  filename         = data.archive_file.visitor_counter_zip.output_path
  function_name    = "visitor-counter"
  role            = aws_iam_role.visitor_lambda_exec.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 128

  source_code_hash = data.archive_file.visitor_counter_zip.output_base64sha256

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.visitor_counter.name
    }
  }

  tags = {
    Name        = "visitor_counter_function"
    Environment = "production"
  }

  depends_on = [
    aws_iam_role_policy_attachment.visitor_lambda_logs,
    aws_iam_role_policy.visitor_lambda_dynamodb,
  ]
}

# API Gateway for the visitor counter
resource "aws_api_gateway_rest_api" "visitor_api" {
  name        = "visitor-counter-api"
  description = "API for visitor counter"
}

resource "aws_api_gateway_resource" "visitor_resource" {
  rest_api_id = aws_api_gateway_rest_api.visitor_api.id
  parent_id   = aws_api_gateway_rest_api.visitor_api.root_resource_id
  path_part   = "visitor-count"
}

resource "aws_api_gateway_method" "visitor_method" {
  rest_api_id   = aws_api_gateway_rest_api.visitor_api.id
  resource_id   = aws_api_gateway_resource.visitor_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# Enable CORS for the method
resource "aws_api_gateway_method" "visitor_options" {
  rest_api_id   = aws_api_gateway_rest_api.visitor_api.id
  resource_id   = aws_api_gateway_resource.visitor_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "visitor_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.visitor_api.id
  resource_id = aws_api_gateway_resource.visitor_resource.id
  http_method = aws_api_gateway_method.visitor_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "visitor_options_response" {
  rest_api_id = aws_api_gateway_rest_api.visitor_api.id
  resource_id = aws_api_gateway_resource.visitor_resource.id
  http_method = aws_api_gateway_method.visitor_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "visitor_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.visitor_api.id
  resource_id = aws_api_gateway_resource.visitor_resource.id
  http_method = aws_api_gateway_method.visitor_options.http_method
  status_code = aws_api_gateway_method_response.visitor_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://d2uj2m1tmcf0dw.cloudfront.net'"
  }
}

resource "aws_api_gateway_integration" "visitor_integration" {
  rest_api_id = aws_api_gateway_rest_api.visitor_api.id
  resource_id = aws_api_gateway_resource.visitor_resource.id
  http_method = aws_api_gateway_method.visitor_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.visitor_counter.invoke_arn
}

resource "aws_api_gateway_deployment" "visitor_deployment" {
  depends_on = [
    aws_api_gateway_integration.visitor_integration,
    aws_api_gateway_integration.visitor_options_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.visitor_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.visitor_resource.id,
      aws_api_gateway_method.visitor_method.id,
      aws_api_gateway_integration.visitor_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "visitor_stage" {
  deployment_id = aws_api_gateway_deployment.visitor_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.visitor_api.id
  stage_name    = "prod"
}

resource "aws_lambda_permission" "visitor_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitor_counter.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.visitor_api.execution_arn}/*/*"
}

# Output the API endpoint
output "visitor_counter_api_url" {
  description = "URL of the visitor counter API"
  value       = "${aws_api_gateway_stage.visitor_stage.invoke_url}/visitor-count"
}
