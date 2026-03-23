# frozen_string_literal: true

class Users::ValidateAdminPasswordChangeInteractor
  include Interactor

  # Reads:  context.current_user, context.new_password, context.password_confirmation
  # Writes: nothing (fails context if caller is not manager/executive, or passwords don't match)

  def call
    unless context.current_user.manager? || context.current_user.executive?
      context.fail!(message: "Forbidden. Insufficient permissions.", http_status: :forbidden)
      return
    end

    if context.new_password != context.password_confirmation
      context.fail!(message: "Password confirmation does not match.")
    end
  end
end
