# frozen_string_literal: true

class Api::V1::Licenses::SeatsController < Api::BaseController
  before_action :set_license
  before_action :require_manager_or_executive!, only: [ :create, :destroy ]

  def index
    seats = @license.license_seats.includes(:user).order(created_at: :asc)
    render json: {
      status: {
        code: 200,
        message: "Seats retrieved successfully.",
        data: { seats: LicenseSeatBlueprint.render_as_hash(seats) }
      }
    }, status: :ok
  end

  def create
    result = Licenses::AssignLicenseSeatUsecase.call(
      license: @license,
      user_email: params[:user_email]
    )

    if result.success?
      render json: {
        status: {
          code: 201,
          message: "Seat assigned successfully.",
          data: {
            seat: LicenseSeatBlueprint.render_as_hash(result.license_seat),
            license: LicenseBlueprint.render_as_hash(@license.reload)
          }
        }
      }, status: :created
    else
      render json: { status: result.http_status == :not_found ? 404 : 422, message: result.message },
             status: result.http_status || :unprocessable_entity
    end
  end

  def destroy
    result = Licenses::RemoveLicenseSeatUsecase.call(
      license: @license,
      seat_id: params[:id]
    )

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "Seat released successfully.",
          data: { license: LicenseBlueprint.render_as_hash(@license.reload) }
        }
      }, status: :ok
    else
      render json: { status: 404, message: result.message }, status: :not_found
    end
  end

  private

  def set_license
    @license = License.find(params[:license_id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "License not found." }, status: :not_found
  end

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end
end
