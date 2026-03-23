# frozen_string_literal: true

class Users::ValidateEmailChangeParamsInteractor
  include Interactor

  # Reads:  context.target_user, context.current_password, context.new_email
  # Writes: nothing (fails context on validation error)

  def call
    unless context.target_user.valid_password?(context.current_password)
      context.fail!(message: "Current password is incorrect.")
      return
    end

    if context.new_email.blank?
      context.fail!(message: "Email can't be blank.")
      return
    end

    if context.new_email == context.target_user.email
      context.fail!(message: "New email must differ from the current email.")
      return
    end

    if User.exists?(email: context.new_email)
      context.fail!(message: "Email is already taken.")
    end
  end
end
