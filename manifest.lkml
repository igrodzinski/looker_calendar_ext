project_name: "looker_calendar_ext"
application: month_end_filter {
  label: "Month End Filter Extension"
  file: "dist/month_end_filter.js"
  entitlements: {
    core_api_methods: ["theme_or_default", "all_dashboards", "dashboard", "update_dashboard", "run_inline_query"]
    use_embeds: yes
  }
  mount_points: {
    dashboard_tile: yes
  }
}
