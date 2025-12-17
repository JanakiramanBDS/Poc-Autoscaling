# --- Keep your existing SNS Topic ---
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# --- 1. CPU Alarm (Existing) ---
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "85"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions = { ClusterName = aws_ecs_cluster.main.name
  ServiceName = aws_ecs_service.main.name }
}

# --- 2. Memory Alarm (NEW) ---
# "Alert me if we have a memory leak"
resource "aws_cloudwatch_metric_alarm" "memory_high" {
  alarm_name          = "high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "90"
  alarm_description   = "Critical Memory Usage > 90%"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions = { ClusterName = aws_ecs_cluster.main.name
  ServiceName = aws_ecs_service.main.name }
}

# --- 3. 5XX Error Alarm (NEW - IMPRESSIVE) ---
# "Alert me if the site crashes"
resource "aws_cloudwatch_metric_alarm" "errors_high" {
  alarm_name          = "high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "5" # Alert if we see more than 5 errors in a minute
  alarm_description   = "High rate of 500 errors detected"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions          = { LoadBalancer = aws_lb.main.arn_suffix }
}