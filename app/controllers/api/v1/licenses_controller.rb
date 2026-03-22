# frozen_string_literal: true

class Api::V1::LicensesController < Api::BaseController
  before_action :require_manager_or_executive!, only: [ :create, :update ]
  before_action :set_license, only: [ :update ]

  def index
    per_page    = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, 100 ].min : 25
    page        = params[:page].present? ? [ params[:page].to_i, 1 ].max : 1
    offset      = (page - 1) * per_page
    scope       = filtered_licenses
    total       = scope.count
    licenses    = scope.order(created_at: :desc).limit(per_page).offset(offset)
    total_pages = (total.to_f / per_page).ceil

    render json: {
      status: {
        code: 200,
        message: "Licenses retrieved successfully.",
        data: {
          licenses: LicenseBlueprint.render_as_hash(licenses),
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

  def create
    result = Licenses::CreateLicenseUsecase.call(license_params: license_params)

    if result.success?
      render json: {
        status: {
          code: 201,
          message: "License registered successfully.",
          data: { license: LicenseBlueprint.render_as_hash(result.license) }
        }
      }, status: :created
    else
      render json: { status: 422, message: result.message }, status: :unprocessable_entity
    end
  end

  def update
    result = Licenses::UpdateLicenseUsecase.call(license: @license, license_params: license_params)

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "License updated successfully.",
          data: { license: LicenseBlueprint.render_as_hash(result.license) }
        }
      }, status: :ok
    else
      render json: { status: 422, message: result.message }, status: :unprocessable_entity
    end
  end

  private

  def filtered_licenses
    scope = License.all

    if params[:q].present?
      q = "%#{params[:q]}%"
      scope = scope.where("software_name ILIKE ? OR vendor ILIKE ? OR purchase_order_number ILIKE ?", q, q, q)
    end

    if params[:status].present?
      today = Date.today
      scope = case params[:status]
      when "expired"
                scope.where("expiry_date < ?", today)
      when "expiring_soon"
                scope.where("expiry_date >= ? AND expiry_date <= ?", today, today + 30)
      when "active"
                scope.where("expiry_date > ?", today + 30)
      else
                scope
      end
    end

    scope
  end

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
      :expiry_date, :renewal_contact, :purchase_order_number, :notes,
      :notify_at_60_days, :notify_at_30_days, :notify_at_7_days
    )
  end
end
