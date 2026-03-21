# frozen_string_literal: true

class Api::V1::LicensesController < Api::BaseController
  before_action :require_manager_or_executive!, only: [ :create, :update ]
  before_action :set_license, only: [ :update ]

  def index
    licenses = License.all.order(created_at: :desc)
    render json: {
      status: {
        code: 200,
        message: "Licenses retrieved successfully.",
        data: { licenses: LicenseBlueprint.render_as_hash(licenses) }
      }
    }, status: :ok
  end

  def create
    license = License.new(license_params)

    if license.save
      render json: {
        status: {
          code: 201,
          message: "License registered successfully.",
          data: { license: LicenseBlueprint.render_as_hash(license) }
        }
      }, status: :created
    else
      render json: {
        status: 422,
        message: license.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  def update
    if @license.update(license_params)
      render json: {
        status: {
          code: 200,
          message: "License updated successfully.",
          data: { license: LicenseBlueprint.render_as_hash(@license) }
        }
      }, status: :ok
    else
      render json: {
        status: 422,
        message: @license.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def set_license
    @license = License.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "License not found." }, status: :not_found
  end

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end

  def license_params
    params.require(:license).permit(
      :software_name, :vendor, :license_key, :total_seats, :cost,
      :expiry_date, :renewal_contact, :purchase_order_number, :notes
    )
  end
end
