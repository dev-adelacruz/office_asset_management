# frozen_string_literal: true

class Api::V1::AuditLogsController < Api::BaseController
  before_action :require_executive!

  def index
    logs = AuditLog
      .includes(:actor)
      .by_actor(params[:actor_id])
      .by_action(params[:action_type])
      .by_auditable_type(params[:auditable_type])
      .from_date(params[:from_date])
      .to_date(params[:to_date])
      .recent
      .limit(200)

    render json: {
      status: {
        code: 200,
        message: "Audit logs retrieved successfully.",
        data: { audit_logs: AuditLogBlueprint.render_as_hash(logs) }
      }
    }, status: :ok
  end

  private

  def require_executive!
    authorize_role!(:executive)
  end
end
