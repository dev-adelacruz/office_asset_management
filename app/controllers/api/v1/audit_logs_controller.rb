# frozen_string_literal: true

class Api::V1::AuditLogsController < Api::BaseController
  before_action :require_executive!

  def index
    per_page = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, 100 ].min : 25
    page     = params[:page].present? ? [ params[:page].to_i, 1 ].max : 1
    offset   = (page - 1) * per_page

    scope = AuditLog
      .includes(:actor)
      .by_actor(params[:actor_id])
      .by_action(params[:action_type])
      .by_auditable_type(params[:auditable_type])
      .from_date(params[:from_date])
      .to_date(params[:to_date])
      .recent

    total       = scope.count
    logs        = scope.limit(per_page).offset(offset)
    total_pages = (total.to_f / per_page).ceil

    render json: {
      status: {
        code: 200,
        message: "Audit logs retrieved successfully.",
        data: {
          audit_logs: AuditLogBlueprint.render_as_hash(logs),
          pagination: {
            current_page: page,
            total_pages: total_pages,
            total_count: total,
            per_page: per_page
          }
        }
      }
    }, status: :ok
  end

  private

  def require_executive!
    authorize_role!(:executive)
  end
end
