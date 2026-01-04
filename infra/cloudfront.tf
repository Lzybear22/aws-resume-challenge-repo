# CloudFront Origin Access Identity for S3
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "Origin Access Identity for Resume Website"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "resume_site" {
  enabled = true
  comment = "CloudFront distribution for hunter-ulrich-io resume website"

  # Origin: S3 Static Site
  origin {
    domain_name = aws_s3_bucket.Resume_Website.bucket_regional_domain_name
    origin_id   = "ResumeWebsiteS3"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Origin: API Gateway for /chatbot
  origin {
    domain_name = "${var.api_gateway_id}.execute-api.${var.api_gateway_region}.amazonaws.com"
    origin_id   = "APIGatewayChatbot"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Ordered Cache Behavior for Chatbot
  ordered_cache_behavior {
    path_pattern = "/chatbot*"
    target_origin_id = "APIGatewayChatbot"

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
  }

  # Default Cache Behavior for Static Site
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "ResumeWebsiteS3"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  # SSL / Root Object
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "ResumeWebsiteCloudFront"
  }
}