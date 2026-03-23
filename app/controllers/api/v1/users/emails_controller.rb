# frozen_string_literal: true

class Api::V1::Users::EmailsController < Api::BaseController
  before_action :set_target_user, only: [ :admin_update ]
  skip_before_action :authenticate_user!, only: [ :confirm ]

  def update
    result = Users::ChangeEmailUsecase.call(
      target_user: current_user,
      current_password: email_params[:current_password],
      new_email: email_params[:email]
    )

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "A confirmation link has been sent to #{current_user.reload.pending_email}. Your email won't change until you confirm it."
        }
      }, status: :ok
    else
      render json: { status: result.http_status == :forbidden ? 403 : 422, message: result.message },
             status: result.http_status || :unprocessable_entity
    end
  end

  def admin_update
    result = Users::AdminChangeEmailUsecase.call(
      current_user: current_user,
      target_user: @target_user,
      new_email: admin_email_params[:email]
    )

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "A confirmation link has been sent to #{@target_user.reload.pending_email}. The email won't change until confirmed."
        }
      }, status: :ok
    else
      render json: { status: result.http_status == :forbidden ? 403 : 422, message: result.message },
             status: result.http_status || :unprocessable_entity
    end
  end

  def confirm
    result = Users::ConfirmEmailUsecase.call(token: params[:token])

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "Email address updated successfully."
        }
      }, status: :ok
    else
      render json: { status: 422, message: result.message }, status: :unprocessable_entity
    end
  end

  private

  def set_target_user
    @target_user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "User not found." }, status: :not_found
  end

  def email_params
    params.require(:user).permit(:current_password, :email)
  end

  def admin_email_params
    params.require(:user).permit(:email)
  end
end
