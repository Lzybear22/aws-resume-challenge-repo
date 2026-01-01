# API gateway HTTP API
resource "aws_apigatewayv2_api" "chatbot_api" {
    name          = "chatbot_api"
    protocol_type = "HTTP"
  
}

# Integrate Lambda with API Gateway
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.chatbot_api.id  
  integration_type = "AWS_PROXY"                           
  integration_uri  = aws_lambda_function.chatbot.arn     
  payload_format_version = "2.0"  
}

# Route (endpoint) for POST requests
resource "aws_apigatewayv2_route" "chatbot_route" {
  api_id    = aws_apigatewayv2_api.chatbot_api.id
  route_key = "POST /chatbot"           
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}" 
}


# Deploy the API Gateway
resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.chatbot_api.id
    name        = "prod"    
    auto_deploy = true   
}

# Allow API Gateway to invoke Lambda function
resource "aws_lambda_permission" "allow_apigateway" {
  statement_id = "AllowAPIGatewayInvoke"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chatbot.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.chatbot_api.execution_arn}/*/*"
}