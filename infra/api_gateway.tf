# HTTP API Gateway
resource "aws_apigatewayv2_api" "chatbot_api" {
  name          = "chatbot_api"
  protocol_type = "HTTP"
}

# Lambda integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.chatbot_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.chatbot.arn
  payload_format_version = "2.0"
}

# POST /chatbot route
resource "aws_apigatewayv2_route" "chatbot_route" {
  api_id    = aws_apigatewayv2_api.chatbot_api.id
  route_key = "POST /chatbot"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Stage for API deployment
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.chatbot_api.id
  name        = "prod"
  auto_deploy = true
}