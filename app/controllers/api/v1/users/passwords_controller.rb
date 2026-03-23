# frozen_string_literal: true

class Api::V1::Users::PasswordsController < Api::BaseController
  before_action :set_target_user, only: [ :admin_update ]

  def update
    result = Users::ChangePasswordUsecase.call(
      target_user: current_user,
      current_password: password_params[:current_password],
      new_password: password_params[:password],
      password_confirmation: password_params[:password_confirmation]
    )

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "Password updated successfully. Please sign in again."
        }
      }, status: :ok
    else
      render json: { status: result.http_status == :forbidden ? 403 : 422, message: result.message },
             status: result.http_status || :unprocessable_entity
    end
  end

  def admin_update
    result = Users::AdminChangePasswordUsecase.call(
      current_user: current_user,
      target_user: @target_user,
      new_password: admin_password_params[:password],
      password_confirmation: admin_password_params[:password_confirmation]
    )

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "Password updated successfully."
        }
      }, status: :ok
    else
      render json: { status: result.http_status == :forbidden ? 403 : 422, message: result.message },
             status: result.http_status || :unprocessable_entity
    end
  end

  private

  def set_target_user
    @target_user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "User not found." }, status: :not_found
  end

  def password_params
    params.require(:user).permit(:current_password, :password, :password_confirmation)
  end

  def admin_password_params
    params.require(:user).permit(:password, :password_confirmation)
  end
end
