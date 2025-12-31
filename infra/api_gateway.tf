# Create a API gateway HTTP API
resource "aws_apigatewayv2_api" "chatbot_api" {
    name          = "chatbot_api"                     # Name of the API Gateway
    protocol_type = "HTTP"                             # Protocol type for the API Gateway
  
}

# Integrate Lambda with API Gateway
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.chatbot_api.id   # Connect to the API we just created
  integration_type = "AWS_PROXY"                            # Lambda proxy integration: sends the full request to Lambda
  integration_uri  = aws_lambda_function.chatbot.arn       # The Lambda ARN we want to call
  payload_format_version = "2.0"                            # Modern format for Lambda proxy
}

# Create a route (endpoint) for POST requests
resource "aws_apigatewayv2_route" "chatbot_route" {
  api_id    = aws_apigatewayv2_api.chatbot_api.id
  route_key = "POST /chatbot"                    # Endpoint will be POST at /chatbot
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"  # Connect route to Lambda integration
}


# Deploy the API Gateway
resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.chatbot_api.id
    name        = "prod"                        # Default stage for the API
    auto_deploy = true                             # Automatically deploy changes to the API
}