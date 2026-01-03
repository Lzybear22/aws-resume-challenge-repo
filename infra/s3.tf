# Create S3 bucket for resume website
resource "aws_s3_bucket" "Resume_Website" {
  bucket = "hunter-ulrich-io"

  tags = {
    Name        = "Resume_Website_Bucket"
    Environment = "production"
  }
}

# Upload index.html
resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.Resume_Website.id
  key          = "index.html"
  source       = "../website/index.html"
  content_type = "text/html"
}

# Upload style.css
resource "aws_s3_object" "style" {
  bucket       = aws_s3_bucket.Resume_Website.id
  key          = "style.css"
  source       = "../website/style.css"
  content_type = "text/css"
}

# Upload script.js
resource "aws_s3_object" "script" {
  bucket       = aws_s3_bucket.Resume_Website.id
  key          = "script.js"
  source       = "../website/script.js"
  content_type = "application/javascript"
}

# Upload SVG images
locals {
  svg_images = fileset("../website/images", "*.svg")
}

resource "aws_s3_object" "svg_images" {
  for_each     = { for file in local.svg_images : file => file }
  bucket       = aws_s3_bucket.Resume_Website.id
  key          = "images/${each.key}"
  source       = "../website/images/${each.value}"
  content_type = "image/svg+xml"
}

# Upload JPEG images
locals {
  jpeg_images = fileset("../website/images", "*.JPEG")
}

resource "aws_s3_object" "jpeg_images" {
  for_each     = { for file in local.jpeg_images : file => file }
  bucket       = aws_s3_bucket.Resume_Website.id
  key          = "images/${each.key}"
  source       = "../website/images/${each.value}"
  content_type = "image/jpeg"
}

resource "aws_s3_object" "config_js" {
  bucket       = aws_s3_bucket.Resume_Website.id
  key          = "config.js"
  source       = "../website/config.js"
  content_type = "application/javascript"  
}

resource "aws_s3_bucket_policy" "private_bucket_policy" {
  bucket = aws_s3_bucket.Resume_Website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
      Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.Resume_Website.arn}/*"
      }
    ]
  }
  ) 
}