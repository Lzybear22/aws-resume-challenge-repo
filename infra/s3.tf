# Create S3 bucket for resume website
resource "aws_s3_bucket" "resume_website" {
  bucket = var.bucket_name

  tags = merge(local.common_tags, {
    Name = "resume-website-bucket"
  })
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "resume_website" {
  bucket = aws_s3_bucket.resume_website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "resume_website" {
  bucket = aws_s3_bucket.resume_website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Upload index.html
resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.resume_website.id
  key          = "index.html"
  source       = "../website/index.html"
  content_type = "text/html"
  etag         = filemd5("../website/index.html")

  tags = local.common_tags
}

# Upload style.css
resource "aws_s3_object" "style" {
  bucket       = aws_s3_bucket.resume_website.id
  key          = "style.css"
  source       = "../website/style.css"
  content_type = "text/css"
  etag         = filemd5("../website/style.css")

  tags = local.common_tags
}

# Upload script.js
resource "aws_s3_object" "script" {
  bucket       = aws_s3_bucket.resume_website.id
  key          = "script.js"
  source       = "../website/script.js"
  content_type = "application/javascript"
  etag         = filemd5("../website/script.js")

  tags = local.common_tags
}

# Upload resume PDF
resource "aws_s3_object" "resume" {
  bucket       = aws_s3_bucket.resume_website.id
  key          = "resume.pdf"
  source       = "../website/resume.pdf"
  content_type = "application/pdf"
  etag         = filemd5("../website/resume.pdf")

  tags = local.common_tags
}

# Upload config.js
resource "aws_s3_object" "config_js" {
  bucket       = aws_s3_bucket.resume_website.id
  key          = "config.js"
  source       = "../website/config.js"
  content_type = "application/javascript"
  etag         = filemd5("../website/config.js")

  tags = local.common_tags
}

# Upload SVG images
resource "aws_s3_object" "svg_images" {
  for_each     = { for file in local.svg_images : file => file }
  bucket       = aws_s3_bucket.resume_website.id
  key          = "images/${each.key}"
  source       = "../website/images/${each.value}"
  content_type = "image/svg+xml"
  etag         = filemd5("../website/images/${each.value}")

  tags = local.common_tags
}

# Upload JPEG images
resource "aws_s3_object" "jpeg_images" {
  for_each     = { for file in local.jpeg_images : file => file }
  bucket       = aws_s3_bucket.resume_website.id
  key          = "images/${each.key}"
  source       = "../website/images/${each.value}"
  content_type = "image/jpeg"
  etag         = filemd5("../website/images/${each.value}")

  tags = local.common_tags
}

# S3 bucket policy for CloudFront access only
resource "aws_s3_bucket_policy" "private_bucket_policy" {
  bucket = aws_s3_bucket.resume_website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.resume_website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.resume_website]
}
