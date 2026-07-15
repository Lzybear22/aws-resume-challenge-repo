# Route 53 and ACM resources commented out until domain is purchased.
# Uncomment after buying hunterulrich.io and pointing nameservers to Route 53.

# data "aws_route53_zone" "main" {
#   name         = var.domain_name
#   private_zone = false
# }

# resource "aws_acm_certificate" "ssl_certificate" {
#   provider          = aws.us_east_1
#   domain_name       = var.domain_name
#   subject_alternative_names = ["*.${var.domain_name}"]
#   validation_method = "DNS"
#   lifecycle {
#     create_before_destroy = true
#   }
#   tags = {
#     Name = "${var.domain_name} SSL Certificate"
#   }
# }

# resource "aws_acm_certificate_validation" "ssl_certificate" {
#   provider                = aws.us_east_1
#   certificate_arn         = aws_acm_certificate.ssl_certificate.arn
#   validation_record_fqdns = [for record in aws_route53_record.ssl_validation : record.fqdn]
# }

# resource "aws_route53_record" "ssl_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.ssl_certificate.domain_validation_options : dvo.domain_name => {
#       name   = dvo.resource_record_name
#       record = dvo.resource_record_value
#       type   = dvo.resource_record_type
#     }
#   }
#   allow_overwrite = true
#   name            = each.value.name
#   records         = [each.value.record]
#   ttl             = 60
#   type            = each.value.type
#   zone_id         = data.aws_route53_zone.main.zone_id
# }

# resource "aws_route53_record" "apex" {
#   zone_id = data.aws_route53_zone.main.zone_id
#   name    = var.domain_name
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.resume_site.domain_name
#     zone_id                = aws_cloudfront_distribution.resume_site.hosted_zone_id
#     evaluate_target_health = false
#   }
# }

# resource "aws_route53_record" "www" {
#   zone_id = data.aws_route53_zone.main.zone_id
#   name    = "www.${var.domain_name}"
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.resume_site.domain_name
#     zone_id                = aws_cloudfront_distribution.resume_site.hosted_zone_id
#     evaluate_target_health = false
#   }
# }

# output "name_servers" {
#   description = "Name servers for the domain"
#   value       = data.aws_route53_zone.main.name_servers
# }

output "domain_url" {
  description = "Your website URL (CloudFront domain until custom domain is set up)"
  value       = "https://${aws_cloudfront_distribution.resume_site.domain_name}"
}
