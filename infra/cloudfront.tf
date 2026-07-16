# Data source to reference the existing AWS managed policy
data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-CORS-with-preflight-and-SecurityHeadersPolicy"
}

# CloudFront Origin Access Identity for S3
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "Origin Access Identity for Resume Website"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "resume_site" {
  enabled             = true
  comment             = "CloudFront distribution for resume website"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  # Origin: S3 Static Site
  origin {
    domain_name = aws_s3_bucket.resume_website.bucket_regional_domain_name
    origin_id   = "resume-website-s3"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Origin: API Gateway for /chatbot
  origin {
    domain_name = "${aws_apigatewayv2_api.chatbot_api.id}.execute-api.${var.aws_region}.amazonaws.com"
    origin_id   = "api-gateway-chatbot"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin: Visitor Counter API
  origin {
    domain_name = "${aws_api_gateway_rest_api.visitor_api.id}.execute-api.${var.aws_region}.amazonaws.com"
    origin_id   = "visitor-counter-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Ordered Cache Behavior for Chatbot
  ordered_cache_behavior {
    path_pattern               = "/chatbot*"
    target_origin_id           = "api-gateway-chatbot"
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id

    allowed_methods = ["HEAD", "GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["Content-Type"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # Ordered Cache Behavior for Visitor Counter
  ordered_cache_behavior {
    path_pattern               = "/visitor-count*"
    target_origin_id           = "visitor-counter-api"
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id

    allowed_methods = ["HEAD", "GET", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      headers      = ["Content-Type"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # Default Cache Behavior for Static Site
  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "resume-website-s3"
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
    min_ttl                    = 0
    default_ttl                = 86400
    max_ttl                    = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  # Custom error page for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.ssl_certificate.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = merge(local.common_tags, {
    Name = "resume-website-cloudfront"
  })

}
