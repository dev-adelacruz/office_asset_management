# frozen_string_literal: true

class Users::ValidateCurrentPasswordInteractor
  include Interactor

  # Reads:  context.target_user, context.current_password, context.new_password,
  #         context.password_confirmation
  # Writes: nothing (fails context on invalid password or validation error)

  def call
    unless context.target_user.valid_password?(context.current_password)
      context.fail!(message: "Current password is incorrect.")
      return
    end

    if context.new_password == context.current_password
      context.fail!(message: "New password must differ from the current password.")
      return
    end

    if context.new_password != context.password_confirmation
      context.fail!(message: "Password confirmation does not match.")
    end
  end
end
