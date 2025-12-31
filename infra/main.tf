variable "aws_profile" {
  default = "hunter.test"
}

provider "aws" {
  region  = "us-west-2"
  profile = var.aws_profile
}
