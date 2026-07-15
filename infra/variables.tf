variable "domain_name" {
  description = "Your domain name"
  type        = string
  default     = "hunterulrich.io"
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

variable "api_gateway_id" {
  description = "API Gateway ID"
  type        = string
}

variable "api_gateway_region" {
  description = "API Gateway region"
  type        = string
}

variable "env_var_1" {
  description = "Lambda environment variable 1"
  type        = string
}

variable "env_var_2" {
  description = "Lambda environment variable 2"
  type        = string
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
