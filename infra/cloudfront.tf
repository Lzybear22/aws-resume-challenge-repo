# Data source to reference the existing AWS managed policy
data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-CORS-with-preflight-and-SecurityHeadersPolicy"
}
# CloudFront Origin Access Identity for S3
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "Origin Access Identity for Resume Website"
}

# Security headers policy (FREE)
# resource "aws_cloudfront_response_headers_policy" "security_headers" {
#   name = "resume-website-security-headers"

#   security_headers_config {
#     strict_transport_security {
#       access_control_max_age_sec = 31536000
#       include_subdomains         = true
#       override                   = true
#     }
#     content_type_options {
#       override = true
#     }
#     frame_options {
#       frame_option = "DENY"
#       override     = true
#     }
#     referrer_policy {
#       referrer_policy = "strict-origin-when-cross-origin"
#       override        = true
#     }
#   }
# }

# CloudFront Distribution
resource "aws_cloudfront_distribution" "resume_site" {
  enabled = true
  comment = "CloudFront distribution for resume website"

  # Origin: S3 Static Site
  origin {
    domain_name = aws_s3_bucket.resume_website.bucket_regional_domain_name
    origin_id   = "resume-website-s3"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Origin: API Gateway for /chatbot
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

  # Ordered Cache Behavior for Chatbot
  ordered_cache_behavior {
    path_pattern           = "/chatbot*"
    target_origin_id       = "api-gateway-chatbot"
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

  # Custom error page for SPA routing (FREE)
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # SSL Certificate
  viewer_certificate {
    cloudfront_default_certificate = true
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
