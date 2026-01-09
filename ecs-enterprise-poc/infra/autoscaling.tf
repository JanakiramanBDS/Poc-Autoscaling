resource "aws_appautoscaling_target" "target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# === REACTIVE SCALING POLICIES (Immediate Response) ===

resource "aws_appautoscaling_policy" "cpu" {
  name               = "scale-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.target.resource_id
  scalable_dimension = aws_appautoscaling_target.target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
    scale_out_cooldown  = 60    # Scale out faster for load spikes
    scale_in_cooldown   = 300   # Scale in slower to avoid flapping
  }

  # NOTE: AWS Predictive Scaling automatically activates on this policy
  # after 14 days of historical CloudWatch data.
  # No additional configuration needed - just wait for data to accumulate.
  # Timeline:
  # - Days 1-13: Reactive scaling only (CPU/Memory rules)
  # - Day 14+: ML model starts learning patterns
  # - Day 21+: Predictive mode fully active (forecasts 48 hours ahead) 
}

# Memory-based scaling policy
resource "aws_appautoscaling_policy" "memory" {
  name               = "scale-memory"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.target.resource_id
  scalable_dimension = aws_appautoscaling_target.target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}