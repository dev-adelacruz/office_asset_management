# frozen_string_literal: true

class Api::V1::Licenses::SeatsController < Api::BaseController
  before_action :set_license
  before_action :require_manager_or_executive!, only: [ :create, :destroy ]
  before_action :set_seat, only: [ :destroy ]

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
    user = User.find_by(email: params[:user_email])

    unless user
      return render json: {
        status: 404,
        message: "User not found with email '#{params[:user_email]}'."
      }, status: :not_found
    end

    seat = @license.license_seats.build(user: user)

    if seat.save
      render json: {
        status: {
          code: 201,
          message: "Seat assigned successfully.",
          data: {
            seat: LicenseSeatBlueprint.render_as_hash(seat),
            license: LicenseBlueprint.render_as_hash(@license.reload)
          }
        }
      }, status: :created
    else
      render json: {
        status: 422,
        message: seat.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @seat.destroy
    render json: {
      status: {
        code: 200,
        message: "Seat released successfully.",
        data: { license: LicenseBlueprint.render_as_hash(@license.reload) }
      }
    }, status: :ok
  end

  private

  def set_license
    @license = License.find(params[:license_id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "License not found." }, status: :not_found
  end

  def set_seat
    @seat = @license.license_seats.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Seat not found." }, status: :not_found
  end

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end
end
