# frozen_string_literal: true

class Api::V1::Users::ProfilesController < Api::BaseController
  before_action :set_target_user

  def update
    result = Users::UpdateProfileUsecase.call(
      current_user: current_user,
      target_user: @target_user,
      profile_params: profile_params
    )

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "Profile updated successfully.",
          data: { user: UserBlueprint.render_as_hash(result.target_user) }
        }
      }, status: :ok
    else
      render json: { status: result.http_status == :forbidden ? 403 : 422, message: result.message },
             status: result.http_status || :unprocessable_entity
    end
  end

  private

  def set_target_user
    @target_user = params[:id].present? ? User.find(params[:id]) : current_user
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "User not found." }, status: :not_found
  end

  def profile_params
    params.require(:user).permit(:name, :phone_number, :office_location, :avatar_url)
  end
end
