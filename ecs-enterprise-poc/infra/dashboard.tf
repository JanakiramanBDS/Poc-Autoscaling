resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-executive-dashboard"
  dashboard_body = jsonencode({
    widgets = [
      # --- ROW 1: The "Is it Broken?" Row ---
      {
        type = "metric", x = 0, y = 0, width = 6, height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { "color" : "#d62728", "label" : "Server Errors (5xx)" }],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", { "color" : "#ff7f0e", "label" : "Client Errors (4xx)" }]
          ]
          view  = "timeSeries", region = var.aws_region, stat = "Sum", period = 60
          title = "🚨 Error Rates (The 'Panic' Graph)"
        }
      },
      {
        type = "metric", x = 6, y = 0, width = 6, height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { "color" : "#9467bd", "label" : "Avg Latency" }]
          ]
          view  = "timeSeries", region = var.aws_region, stat = "Average", period = 60
          title = "⚡ Performance (Target Response Time)"
          yAxis = { left = { min = 0, showUnits = false, label = "Seconds" } }
        }
      },

      # --- ROW 2: The "Scale" Row ---
      {
        type = "metric", x = 0, y = 6, width = 6, height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix, { "stat" : "Sum", "period" : 60, "label" : "Total Requests" }]
          ]
          view  = "timeSeries", region = var.aws_region
          title = "🌊 Traffic Volume (Requests/Min)"
        }
      },
      {
        type = "metric", x = 6, y = 6, width = 6, height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.main.name, { "color" : "#2ca02c", "label" : "CPU %" }],
            [".", "MemoryUtilization", ".", ".", ".", ".", { "color" : "#1f77b4", "label" : "Memory %" }]
          ]
          view  = "timeSeries", region = var.aws_region, stat = "Average", period = 60
          title = "🔥 Resource Saturation (CPU vs RAM)"
          yAxis = { left = { max = 100, min = 0 } }
        }
      },

      # --- ROW 3: The "Cost" Row ---
      {
        type = "metric", x = 0, y = 12, width = 12, height = 6
        properties = {
          metrics = [
            ["ECS/ContainerInsights", "TaskCount", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.main.name, { "stat" : "Average", "period" : 60 }]
          ]
          view  = "timeSeries", region = var.aws_region
          title = "💰 Active Fargate Tasks (Auto Scaling Count)"
        }
      }
    ]
  })
}