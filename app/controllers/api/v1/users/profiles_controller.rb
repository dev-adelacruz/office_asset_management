# frozen_string_literal: true

class Api::V1::Users::ProfilesController < Api::BaseController
  before_action :set_target_user

  def update
    if @target_user.update(profile_params)
      render json: {
        status: {
          code: 200,
          message: "Profile updated successfully.",
          data: { user: UserBlueprint.render_as_hash(@target_user) }
        }
      }, status: :ok
    else
      render json: {
        status: 422,
        message: @target_user.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def set_target_user
    if params[:id].present?
      unless current_user.manager? || current_user.executive?
        render json: { status: 403, message: "Forbidden. Insufficient permissions." }, status: :forbidden
        return
      end

      @target_user = User.find(params[:id])
    else
      @target_user = current_user
    end
  end

  def profile_params
    params.require(:user).permit(:name, :phone_number, :office_location, :avatar_url)
  end
end
