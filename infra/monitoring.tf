# SNS topic for alarm emails
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"
  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "alerts_email" {
  count     = nonsensitive(var.alert_email != "") ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# CloudFront metrics are only in us-east-1, and an alarm can only
# send to a topic in its own region, so it needs a second topic there
resource "aws_sns_topic" "alerts_us_east_1" {
  provider = aws.us_east_1
  name     = "${var.project_name}-alerts"
  tags     = local.common_tags
}

resource "aws_sns_topic_subscription" "alerts_email_us_east_1" {
  provider  = aws.us_east_1
  count     = nonsensitive(var.alert_email != "") ? 1 : 0
  topic_arn = aws_sns_topic.alerts_us_east_1.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Visitor counter returning 500s
# (the Lambda catches its own errors, so Lambda's Errors metric stays at 0)
resource "aws_cloudwatch_metric_alarm" "visitor_counter_5xx" {
  alarm_name          = "${var.project_name}-visitor-counter-5xx"
  alarm_description   = "Visitor counter API is returning 500 errors"
  namespace           = "AWS/ApiGateway"
  metric_name         = "5XXError"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = aws_api_gateway_rest_api.visitor_api.name
    Stage   = aws_api_gateway_stage.visitor_stage.stage_name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
  tags          = local.common_tags
}

# Chatbot API returning 5xx (HTTP APIs use "5xx" and ApiId)
resource "aws_cloudwatch_metric_alarm" "chatbot_5xx" {
  alarm_name          = "${var.project_name}-chatbot-5xx"
  alarm_description   = "Chatbot API is returning 5xx errors"
  namespace           = "AWS/ApiGateway"
  metric_name         = "5xx"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiId = aws_apigatewayv2_api.chatbot_api.id
    Stage = aws_apigatewayv2_stage.prod.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
  tags          = local.common_tags
}

# Website returning 5xx errors (S3 or CloudFront problem)
resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx" {
  provider            = aws.us_east_1
  alarm_name          = "${var.project_name}-cloudfront-5xx"
  alarm_description   = "More than 10% of website requests are failing with 5xx errors"
  namespace           = "AWS/CloudFront"
  metric_name         = "5xxErrorRate"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 1
  threshold           = 10
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.resume_site.id
    Region         = "Global"
  }

  alarm_actions = [aws_sns_topic.alerts_us_east_1.arn]
  ok_actions    = [aws_sns_topic.alerts_us_east_1.arn]
  tags          = local.common_tags
}
