# HTTP API Gateway
resource "aws_apigatewayv2_api" "chatbot_api" {
  name          = "chatbot_api"
  protocol_type = "HTTP"

  #CORS Configuration
  cors_configuration {
  allow_origins = ["*"] # Make cloudfront domain next
  allow_methods = ["POST", "OPTIONS"]
  allow_headers = ["content-type"]
}

}

# Lambda integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.chatbot_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.chatbot.invoke_arn
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

# Permissions for API Gateway to invoke Lambda
resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chatbot.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chatbot_api.execution_arn}/*/*"
}

# Output the API Gateway endpoint
output "chatbot_api_url" {
  value = "${aws_apigatewayv2_api.chatbot_api.api_endpoint}/prod/chatbot"
}