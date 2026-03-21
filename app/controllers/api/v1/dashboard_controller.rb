# frozen_string_literal: true

class Api::V1::DashboardController < Api::BaseController
  def index
    date_range = resolve_date_range(params[:period])

    asset_counts = Asset.group(:status).count
    category_counts = Asset.group(:category).count

    scoped_assets = date_range ? Asset.where(created_at: date_range) : Asset.all
    scoped_requests = date_range ? AssetRequest.where(created_at: date_range) : AssetRequest.all

    asset_total, asset_total_value = Asset.pick(
      Arel.sql("COUNT(*)"),
      Arel.sql("COALESCE(SUM(purchase_cost), 0)"),
    )

    license_total, license_active, license_expiring_soon, license_expired, license_total_seats =
      License.pick(
        Arel.sql("COUNT(*)"),
        Arel.sql("COUNT(CASE WHEN expiry_date > CURRENT_DATE + 30 THEN 1 END)"),
        Arel.sql(
          "COUNT(CASE WHEN expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + 30 THEN 1 END)",
        ),
        Arel.sql("COUNT(CASE WHEN expiry_date < CURRENT_DATE THEN 1 END)"),
        Arel.sql("COALESCE(SUM(total_seats), 0)"),
      )

    license_counts = {
      total: license_total,
      active: license_active,
      expiring_soon: license_expiring_soon,
      expired: license_expired,
      utilization: {
        total_seats: license_total_seats,
        used_seats: LicenseSeat.count
      }
    }

    request_counts = scoped_requests.group(:status).count

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
            total: asset_total,
            total_value: asset_total_value.to_f,
            period_additions: scoped_assets.count,
            period_spend: scoped_assets.sum(:purchase_cost).to_f,
            by_status: {
              available: asset_counts["available"] || 0,
              assigned: asset_counts["assigned"] || 0,
              under_maintenance: asset_counts["under_maintenance"] || 0,
              retired: asset_counts["retired"] || 0,
              lost: asset_counts["lost"] || 0
            },
            by_category: {
              laptop: category_counts["laptop"] || 0,
              monitor: category_counts["monitor"] || 0,
              peripheral: category_counts["peripheral"] || 0,
              furniture: category_counts["furniture"] || 0,
              other: category_counts["other"] || 0
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

  private

  def resolve_date_range(period)
    today = Date.today

    case period
    when "this_month"
      today.beginning_of_month..today.end_of_month
    when "last_month"
      last = today.last_month
      last.beginning_of_month..last.end_of_month
    when "last_quarter"
      3.months.ago.to_date..today
    when "this_year"
      today.beginning_of_year..today.end_of_year
    end
  end
end
