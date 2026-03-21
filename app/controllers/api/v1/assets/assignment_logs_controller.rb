# frozen_string_literal: true

class Api::V1::Assets::AssignmentLogsController < Api::BaseController
  before_action :set_asset
  before_action :require_manager_or_executive!, only: [ :create, :update ]
  before_action :set_log, only: [ :update ]

  def index
    logs = @asset.asset_assignment_logs
                 .includes(:assigned_to, :assigned_by)
                 .order(assigned_at: :desc)

    render json: {
      status: {
        code: 200,
        message: "Assignment history retrieved successfully.",
        data: { assignment_logs: AssetAssignmentLogBlueprint.render_as_hash(logs) }
      }
    }, status: :ok
  end

  def create
    log = @asset.asset_assignment_logs.new(assignment_log_params)
    log.assigned_by = current_user

    if log.save
      @asset.update!(status: :assigned)

      render json: {
        status: {
          code: 201,
          message: "Asset assigned successfully.",
          data: { assignment_log: AssetAssignmentLogBlueprint.render_as_hash(log) }
        }
      }, status: :created
    else
      render json: {
        status: 422,
        message: log.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  def update
    if @log.returned_at.present?
      return render json: {
        status: 422,
        message: "This assignment has already been returned."
      }, status: :unprocessable_entity
    end

    if @log.update(returned_at: Time.current)
      open_assignments = @asset.asset_assignment_logs.where(returned_at: nil).where.not(id: @log.id)
      @asset.update!(status: :available) if open_assignments.none?

      render json: {
        status: {
          code: 200,
          message: "Asset return recorded successfully.",
          data: { assignment_log: AssetAssignmentLogBlueprint.render_as_hash(@log) }
        }
      }, status: :ok
    else
      render json: {
        status: 422,
        message: @log.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end

  def set_asset
    @asset = Asset.find(params[:asset_id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Asset not found." }, status: :not_found
  end

  def set_log
    @log = @asset.asset_assignment_logs.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Assignment log not found." }, status: :not_found
  end

  def assignment_log_params
    params.require(:assignment_log).permit(:assigned_to_id, :assigned_at, :notes)
  end
end
