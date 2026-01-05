resource "aws_dynamodb_table" "visitor_counter" {
  name         = "VisitorCounter"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "counterID"

  attribute {
    name = "counterID"
    type = "S"
  }
}