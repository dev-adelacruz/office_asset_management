# frozen_string_literal: true

class Api::V1::DashboardController < Api::BaseController
  def index
    asset_counts = Asset.group(:status).count
    today = Date.today

    license_counts = {
      total: License.count,
      active: License.where("expiry_date > ?", today + 30).count,
      expiring_soon: License.where("expiry_date >= ? AND expiry_date <= ?", today, today + 30).count,
      expired: License.where("expiry_date < ?", today).count
    }

    request_counts = AssetRequest.group(:status).count

    recent_activity = if current_user.role == "executive"
      AuditLog.includes(:actor).recent.limit(5).map do |log|
        {
          type: "audit_log",
          action: log.action,
          description: "#{log.auditable_type} #{log.action}d",
          actor_name: log.actor&.name || log.actor&.email,
          created_at: log.created_at
        }
      end
    else
      current_user.notifications.recent.limit(5).map do |n|
        {
          type: "notification",
          action: n.notification_type,
          description: n.title,
          actor_name: nil,
          created_at: n.created_at
        }
      end
    end

    render json: {
      status: {
        code: 200,
        message: "Dashboard data retrieved successfully.",
        data: {
          assets: {
            total: Asset.count,
            by_status: {
              available: asset_counts["available"] || 0,
              assigned: asset_counts["assigned"] || 0,
              under_maintenance: asset_counts["under_maintenance"] || 0,
              retired: asset_counts["retired"] || 0,
              lost: asset_counts["lost"] || 0
            }
          },
          licenses: license_counts,
          requests: {
            pending: request_counts["pending"] || 0,
            approved: request_counts["approved"] || 0,
            rejected: request_counts["rejected"] || 0
          },
          recent_activity: recent_activity
        }
      }
    }, status: :ok
  end
end
