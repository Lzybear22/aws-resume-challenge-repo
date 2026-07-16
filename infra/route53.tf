resource "aws_acm_certificate" "ssl_certificate" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

output "acm_validation_records" {
  description = "Add CNAME records in Cloudflare to validate the ACM certificate"
  value = {
    for dvo in aws_acm_certificate.ssl_certificate.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}

output "domain_url" {
  description = "Your website URL"
  value       = "https://${var.domain_name}"
}
