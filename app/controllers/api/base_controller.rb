# frozen_string_literal: true

class Api::BaseController < ApplicationController
  before_action :authenticate_user!

  rescue_from ActionController::ParameterMissing do |e|
    render json: { status: 422, message: e.message }, status: :unprocessable_entity
  end

  private

  def authenticate_user!(opts = {})
    unless current_user
      render json: { status: 401, message: "You need to sign in before continuing." }, status: :unauthorized
    end
  end

  def authorize_role!(*roles)
    return if roles.map(&:to_s).include?(current_user.role)

    render json: { status: 403, message: "Forbidden. Insufficient permissions." }, status: :forbidden
  end
end
