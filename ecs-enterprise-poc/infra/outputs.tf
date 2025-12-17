output "alb_url" {
  value = aws_lb.main.dns_name
}

output "ecr_url" {
  value = aws_ecr_repository.repo.repository_url
}

output "bastion_ip" {
  value = aws_instance.bastion.public_ip
}