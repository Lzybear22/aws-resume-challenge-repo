variable "domain_name" {
  description = "Your domain name"
  type        = string
  default     = "hunterulrich.dev"
}

variable "aws_profile" {
  description = "AWS CLI profile name"
  type        = string
  default     = "hunter.test"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "bucket_name" {
  description = "S3 bucket name for resume website"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}
