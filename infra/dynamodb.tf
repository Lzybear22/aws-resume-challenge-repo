# DynamoDB table for visitor counter
resource "aws_dynamodb_table" "visitor_counter" {
  name           = "visitor-counter"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"  # String
  }

  tags = {
    Name        = "Visitor Counter"
    Environment = "production"
    Project     = "resume-website"
  }
}

# Initialize the counter with zero visits
resource "aws_dynamodb_table_item" "visitor_count_init" {
  table_name = aws_dynamodb_table.visitor_counter.name
  hash_key   = aws_dynamodb_table.visitor_counter.hash_key

  item = jsonencode({
    id = {
      S = "visitor-count"
    }
    count = {
      N = "0"
    }
  })

  # Only create if item doesn't exist
  lifecycle {
    ignore_changes = [item]
  }
}

# Output the table name for Lambda functions
output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.visitor_counter.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.visitor_counter.arn
}
