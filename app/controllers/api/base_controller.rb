# frozen_string_literal: true

class Api::BaseController < ApplicationController
  before_action :authenticate_user!

  private

  def authorize_role!(*roles)
    return if roles.map(&:to_s).include?(current_user.role)

    render json: { status: 403, message: "Forbidden. Insufficient permissions." }, status: :forbidden
  end
end
