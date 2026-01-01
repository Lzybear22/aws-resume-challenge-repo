# Lambda function for chatbot
resource "aws_lambda_function" "chatbot" {
    function_name = "chatbot_function" 
    role          = aws_iam_role.lambda_exec.arn 
    handler       = "chatbot.handler"  
    runtime       = "nodejs20.x"             
    filename      = "D:/AWS-Resume-Challenge/lambda/chatbot.zip"  
    memory_size   = 128                       
    timeout       = 10                        

    environment {                             
        variables = {
            ENV_VAR_1 = "value1"              
            ENV_VAR_2 = "value2"             
        }
    }

    tags = {                                
        Name        = "chatbot_function"    
        Environment = "production"        
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